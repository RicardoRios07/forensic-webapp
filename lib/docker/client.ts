/**
 * Docker Client - Real Docker API integration using dockerode
 * Connects to local Docker daemon and provides container management
 */

import Docker from 'dockerode';
import type { ContainerInfo, ContainerStats } from '@/types/forensic';

// Determine the correct Docker socket path
// macOS Docker Desktop: /Users/<user>/.docker/run/docker.sock
// Linux: /var/run/docker.sock
const getDockerSocketPath = (): string => {
  const dockerHost = process.env.DOCKER_HOST;
  if (dockerHost) {
    // Parse unix:// socket paths
    if (dockerHost.startsWith('unix://')) {
      return dockerHost.substring(7); // Remove 'unix://' prefix
    }
    return dockerHost;
  }
  // On macOS, check the local user Docker socket first
  const homeDir = process.env.HOME;
  if (homeDir && process.platform === 'darwin') {
    return `${homeDir}/.docker/run/docker.sock`;
  }
  // Fallback to Linux default
  return '/var/run/docker.sock';
};

// Initialize Docker client
// For macOS with Docker Desktop, this connects via socket
export const dockerClient = new Docker({
  socketPath: getDockerSocketPath(),
});

/**
 * List all containers (running and stopped)
 */
export async function listContainers(): Promise<ContainerInfo[]> {
  try {
    const containers = await dockerClient.listContainers({ all: true });
    
    return containers.map((c) => ({
      id: c.Id,
      name: c.Names[0]?.replace(/^\//, '') || c.Id.substring(0, 12),
      image: c.Image,
      state: c.State,
      status: c.Status,
      created: new Date(c.Created * 1000).toISOString(),
      ports: c.Ports.map((p) => 
        p.PublicPort 
          ? `${p.IP || '0.0.0.0'}:${p.PublicPort}->${p.PrivatePort}/${p.Type}`
          : `${p.PrivatePort}/${p.Type}`
      ).join(', '),
    }));
  } catch (error) {
    console.error('Error listing containers:', error);
    throw new Error(`Failed to list containers: ${error}`);
  }
}

/**
 * Get container by name or ID
 */
export async function getContainer(nameOrId: string) {
  try {
    const container = dockerClient.getContainer(nameOrId);
    await container.inspect(); // Verify it exists
    return container;
  } catch (error) {
    throw new Error(`Container ${nameOrId} not found: ${error}`);
  }
}

/**
 * Get detailed container info
 */
export async function inspectContainer(nameOrId: string) {
  try {
    const container = dockerClient.getContainer(nameOrId);
    const info = await container.inspect();
    return info;
  } catch (error) {
    console.error('Error inspecting container:', error);
    throw new Error(`Failed to inspect container: ${error}`);
  }
}

/**
 * Get container stats (CPU, memory, network)
 */
export async function getContainerStats(nameOrId: string): Promise<ContainerStats> {
  try {
    const container = dockerClient.getContainer(nameOrId);
    const stats = await container.stats({ stream: false });
    const info = await container.inspect();
    
    // Calculate CPU percentage
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuPercent = systemDelta > 0 && cpuDelta > 0 
      ? (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100 
      : 0;
    
    // Calculate memory usage
    const memoryUsage = stats.memory_stats.usage || 0;
    const memoryLimit = stats.memory_stats.limit || 0;
    const memoryPercent = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;
    
    // Calculate uptime
    const startedAt = new Date(info.State.StartedAt);
    const now = new Date();
    const uptimeMs = now.getTime() - startedAt.getTime();
    const uptime = formatUptime(uptimeMs);
    
    return {
      cpuPercent: Number(cpuPercent.toFixed(2)),
      memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
      memoryLimit: Math.round(memoryLimit / 1024 / 1024), // MB
      memoryPercent: Number(memoryPercent.toFixed(2)),
      networkIn: Math.round((stats.networks?.eth0?.rx_bytes || 0) / 1024 / 1024), // MB
      networkOut: Math.round((stats.networks?.eth0?.tx_bytes || 0) / 1024 / 1024), // MB
      uptime,
      running: info.State.Running,
    };
  } catch (error) {
    console.error('Error getting container stats:', error);
    // Return default stats on error
    return {
      cpuPercent: 0,
      memoryUsage: 0,
      memoryLimit: 0,
      memoryPercent: 0,
      networkIn: 0,
      networkOut: 0,
      uptime: '0s',
      running: false,
    };
  }
}

/**
 * Stream logs from container
 */
export async function streamContainerLogs(
  nameOrId: string,
  callback: (log: string) => void,
  options?: {
    follow?: boolean;
    stdout?: boolean;
    stderr?: boolean;
    since?: number;
    until?: number;
    timestamps?: boolean;
    tail?: number;
  }
): Promise<NodeJS.ReadableStream> {
  try {
    const container = dockerClient.getContainer(nameOrId);
    
    const stream = (await container.logs({
      follow: true, // Always follow for streaming
      stdout: options?.stdout ?? true,
      stderr: options?.stderr ?? true,
      since: options?.since,
      until: options?.until,
      timestamps: options?.timestamps ?? true,
      tail: options?.tail ?? 100,
    })) as unknown as NodeJS.ReadableStream;
    
    stream.on('data', (chunk: Buffer) => {
      // Docker logs have 8-byte header, strip it
      const log = chunk.toString('utf8').substring(8);
      callback(log);
    });
    
    stream.on('error', (error: Error) => {
      console.error('Stream error:', error);
    });
    
    return stream;
  } catch (error) {
    console.error('Error streaming logs:', error);
    throw new Error(`Failed to stream logs: ${error}`);
  }
}

/**
 * Execute command inside container
 */
export async function execInContainer(
  nameOrId: string,
  command: string[]
): Promise<string> {
  try {
    const container = dockerClient.getContainer(nameOrId);
    
    const exec = await container.exec({
      Cmd: command,
      AttachStdout: true,
      AttachStderr: true,
    });
    
    const stream = await exec.start({ Detach: false });
    
    return new Promise((resolve, reject) => {
      let output = '';
      
      stream.on('data', (chunk: Buffer) => {
        output += chunk.toString('utf8').substring(8); // Strip Docker header
      });
      
      stream.on('end', () => {
        resolve(output);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error executing command:', error);
    throw new Error(`Failed to execute command: ${error}`);
  }
}

/**
 * Copy file from container
 */
export async function copyFromContainer(
  nameOrId: string,
  path: string
): Promise<NodeJS.ReadableStream> {
  try {
    const container = dockerClient.getContainer(nameOrId);
    const stream = await container.getArchive({ path });
    return stream;
  } catch (error) {
    console.error('Error copying from container:', error);
    throw new Error(`Failed to copy file: ${error}`);
  }
}

/**
 * Get Apache access logs from DVWA container
 */
export async function getApacheAccessLog(containerId: string): Promise<string> {
  try {
    const log = await execInContainer(containerId, [
      'cat',
      '/var/log/apache2/access.log',
    ]);
    return log;
  } catch (error) {
    console.error('Error getting Apache access log:', error);
    return '';
  }
}

/**
 * Get Apache error logs from DVWA container
 */
export async function getApacheErrorLog(containerId: string): Promise<string> {
  try {
    const log = await execInContainer(containerId, [
      'cat',
      '/var/log/apache2/error.log',
    ]);
    return log;
  } catch (error) {
    console.error('Error getting Apache error log:', error);
    return '';
  }
}

/**
 * Format uptime duration
 */
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Check if Docker daemon is accessible
 */
export async function checkDockerConnection(): Promise<boolean> {
  try {
    await dockerClient.ping();
    return true;
  } catch (error) {
    console.error('Docker connection failed:', error);
    return false;
  }
}

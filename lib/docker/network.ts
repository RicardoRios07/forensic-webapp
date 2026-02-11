import { execInContainer } from './client';

export interface NetworkConnection {
  protocol: string;
  localAddress: string;
  localPort: string;
  remoteAddress: string;
  remotePort: string;
  state: string;
  pid?: string;
}

export interface NetworkInterface {
  name: string;
  ipAddress: string;
  netmask: string;
  macAddress: string;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
}

export interface NetworkEvent {
  timestamp: string;
  type: 'connection' | 'dns' | 'port_open' | 'interface_change';
  source: string;
  destination: string;
  protocol: string;
  details: string;
}

/**
 * Get active network connections from container
 */
export async function getNetworkConnections(containerId: string): Promise<NetworkConnection[]> {
  try {
    let output = '';
    
    // Intentar con ss primero, luego con netstat
    try {
      output = await execInContainer(containerId, [
        'ss',
        '-tuln'
      ]);
    } catch {
      try {
        output = await execInContainer(containerId, [
          'netstat',
          '-tuln'
        ]);
      } catch {
        // Si ambos fallan, leer directamente de /proc
        output = await execInContainer(containerId, [
          'cat',
          '/proc/net/tcp'
        ]);
      }
    }

    const lines = output.split('\n').slice(2); // Skip headers
    const connections: NetworkConnection[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 6) continue;

      // Parse based on format
      let protocol = 'tcp';
      let localAddress = '';
      let localPort = '';
      let remoteAddress = '';
      let remotePort = '';
      let state = 'UNKNOWN';

      // If from /proc/net/tcp format
      if (parts[0].includes(':')) {
        // Hex format from /proc
        try {
          const [localHex, localPortHex] = parts[1].split(':');
          const [remoteHex, remotePortHex] = parts[2].split(':');
          
          localAddress = hexToIp(localHex);
          localPort = parseInt(localPortHex, 16).toString();
          remoteAddress = hexToIp(remoteHex);
          remotePort = parseInt(remotePortHex, 16).toString();
          state = getStateFromHex(parts[3]);
        } catch (e) {
          continue;
        }
      } else {
        // netstat or ss format
        [protocol, , , localAddress, remoteAddress, state] = parts;
        const [localIP, localPort_] = localAddress?.split(':') || ['', ''];
        const [remoteIP, remotePort_] = remoteAddress?.split(':') || ['', ''];
        
        localAddress = localIP || '-';
        localPort = localPort_ || '-';
        remoteAddress = remoteIP || '-';
        remotePort = remotePort_ || '-';
      }

      connections.push({
        protocol: protocol || 'tcp',
        localAddress,
        localPort,
        remoteAddress,
        remotePort,
        state: state || 'UNKNOWN',
      });
    }

    return connections;
  } catch (error) {
    console.error('Error getting network connections:', error);
    return [];
  }
}

/**
 * Get network interfaces from container
 */
export async function getNetworkInterfaces(containerId: string): Promise<NetworkInterface[]> {
  try {
    let ifconfigOutput = '';
    
    // Try different commands to get interface info
    try {
      ifconfigOutput = await execInContainer(containerId, [
        'ip',
        'addr'
      ]);
    } catch {
      try {
        ifconfigOutput = await execInContainer(containerId, [
          'ifconfig'
        ]);
      } catch {
        // Fallback to parsing /sys/class/net
        try {
          ifconfigOutput = await execInContainer(containerId, [
            'ls',
            '/sys/class/net'
          ]);
        } catch {
          return [];
        }
      }
    }

    const interfaces: NetworkInterface[] = [];
    const lines = ifconfigOutput.split('\n');
    
    let currentInterface: Partial<NetworkInterface> | null = null;

    for (const line of lines) {
      if (line.match(/^\d+:/)) {
        // New interface line (ip addr format)
        if (currentInterface?.name) {
          interfaces.push({
            name: currentInterface.name,
            ipAddress: currentInterface.ipAddress || '',
            netmask: currentInterface.netmask || '',
            macAddress: currentInterface.macAddress || '',
            rxBytes: currentInterface.rxBytes || 0,
            txBytes: currentInterface.txBytes || 0,
            rxPackets: currentInterface.rxPackets || 0,
            txPackets: currentInterface.txPackets || 0,
          });
        }
        
        const match = line.match(/\d+:\s+([^:]+):/);
        currentInterface = { name: match?.[1] || 'unknown' };
      } else if (line.match(/^[A-Za-z]/)) {
        // New interface line (ifconfig format)
        if (currentInterface?.name) {
          interfaces.push({
            name: currentInterface.name,
            ipAddress: currentInterface.ipAddress || '',
            netmask: currentInterface.netmask || '',
            macAddress: currentInterface.macAddress || '',
            rxBytes: currentInterface.rxBytes || 0,
            txBytes: currentInterface.txBytes || 0,
            rxPackets: currentInterface.rxPackets || 0,
            txPackets: currentInterface.txPackets || 0,
          });
        }
        
        const match = line.match(/^([^\s]+)/);
        currentInterface = { name: match?.[1] || 'unknown' };
      } else if (line.includes('link/ether')) {
        const match = line.match(/link\/ether\s+([0-9a-fA-F:]+)/);
        if (currentInterface && match) {
          currentInterface.macAddress = match[1];
        }
      } else if (line.includes('inet ') && !line.includes('inet6')) {
        const match = line.match(/inet\s+([0-9.]+)\/(\d+)/);
        if (currentInterface && match) {
          currentInterface.ipAddress = match[1];
          const cidr = parseInt(match[2]);
          currentInterface.netmask = cidrToNetmask(cidr);
        }
      } else if (line.includes('HWaddr')) {
        const match = line.match(/HWaddr\s+([0-9a-fA-F:]+)/);
        if (currentInterface && match) {
          currentInterface.macAddress = match[1];
        }
      } else if (line.includes('inet addr')) {
        const match = line.match(/inet addr:\s*([0-9.]+)/);
        const maskMatch = line.match(/Mask:\s*([0-9.]+)/);
        if (currentInterface && match) {
          currentInterface.ipAddress = match[1];
          if (maskMatch) {
            currentInterface.netmask = maskMatch[1];
          }
        }
      }
    }

    // Add last interface
    if (currentInterface?.name) {
      interfaces.push({
        name: currentInterface.name,
        ipAddress: currentInterface.ipAddress || '',
        netmask: currentInterface.netmask || '',
        macAddress: currentInterface.macAddress || '',
        rxBytes: currentInterface.rxBytes || 0,
        txBytes: currentInterface.txBytes || 0,
        rxPackets: currentInterface.rxPackets || 0,
        txPackets: currentInterface.txPackets || 0,
      });
    }

    // Get statistics from /proc/net/dev
    try {
      const statsOutput = await execInContainer(containerId, [
        'cat',
        '/proc/net/dev'
      ]);

      for (const line of statsOutput.split('\n').slice(2)) {
        if (!line.includes(':')) continue;
        
        const parts = line.split(':');
        const name = parts[0].trim();
        const stats = parts[1].split(/\s+/).filter(x => x);
        
        const iface = interfaces.find(i => i.name === name);
        if (iface && stats.length >= 8) {
          iface.rxBytes = parseInt(stats[0]) || 0;
          iface.rxPackets = parseInt(stats[1]) || 0;
          iface.txBytes = parseInt(stats[8]) || 0;
          iface.txPackets = parseInt(stats[9]) || 0;
        }
      }
    } catch (e) {
      console.error('Could not get /proc/net/dev stats:', e);
    }

    return interfaces;
  } catch (error) {
    console.error('Error getting network interfaces:', error);
    return [];
  }
}

/**
 * Get DNS resolution attempts
 */
export async function getDNSResolutions(containerId: string): Promise<Record<string, string>> {
  try {
    let output = '';
    
    try {
      output = await execInContainer(containerId, [
        'cat',
        '/etc/resolv.conf'
      ]);
    } catch {
      // Try alternative location
      try {
        output = await execInContainer(containerId, [
          'cat',
          '/etc/hostname'
        ]);
        
        // Also try to get from environment or other sources
        try {
          const hostsOutput = await execInContainer(containerId, [
            'cat',
            '/etc/hosts'
          ]);
          return { hostname: output.trim(), hosts_entries: hostsOutput.split('\n').length.toString() };
        } catch {
          return { hostname: output.trim() };
        }
      } catch {
        return { status: 'No DNS config available' };
      }
    }

    const nameservers: Record<string, string> = {};
    const lines = output.split('\n');
    let idx = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('nameserver')) {
        const ip = trimmed.split(/\s+/)[1];
        if (ip) {
          nameservers[`nameserver_${idx}`] = ip;
          idx++;
        }
      } else if (trimmed.startsWith('search')) {
        const domains = trimmed.split(/\s+/).slice(1).join(' ');
        if (domains) {
          nameservers['search_domains'] = domains;
        }
      }
    }

    return Object.keys(nameservers).length > 0 ? nameservers : { status: 'Using default DNS' };
  } catch (error) {
    console.error('Error getting DNS resolutions:', error);
    return { error: 'Could not retrieve DNS information' };
  }
}

/**
 * Get listening ports
 */
export async function getListeningPorts(containerId: string): Promise<string[]> {
  try {
    let output = '';
    
    // Intentar con ss primero
    try {
      output = await execInContainer(containerId, [
        'ss',
        '-tuln'
      ]);
    } catch {
      try {
        output = await execInContainer(containerId, [
          'netstat',
          '-tuln'
        ]);
      } catch {
        // Fallback a /proc
        output = await execInContainer(containerId, [
          'cat',
          '/proc/net/tcp'
        ]);
      }
    }

    const ports: string[] = [];
    const lines = output.split('\n').slice(2);

    for (const line of lines) {
      if (!line.trim()) continue;
      
      const parts = line.split(/\s+/);
      if (parts.length < 4) continue;

      let port = '';
      const state = parts[parts.length - 1];
      
      // Check if this is a listening connection
      if (state === 'LISTEN' || state === '0A' || line.includes('LISTEN')) {
        // From ss/netstat format
        const addressPart = parts[3];
        if (addressPart?.includes(':')) {
          port = addressPart.split(':').pop() || '';
        } else if (parts[1]?.includes(':')) {
          // From /proc format (hex)
          const [, portHex] = parts[1].split(':');
          port = parseInt(portHex, 16).toString();
        }
        
        if (port && !ports.includes(port)) {
          ports.push(port);
        }
      }
    }

    return ports.sort((a, b) => parseInt(a) - parseInt(b));
  } catch (error) {
    console.error('Error getting listening ports:', error);
    return [];
  }
}

/**
 * Convert hex IP to dotted decimal
 */
function hexToIp(hex: string): string {
  try {
    const num = parseInt(hex, 16);
    return [
      num & 0xff,
      (num >> 8) & 0xff,
      (num >> 16) & 0xff,
      (num >> 24) & 0xff,
    ].join('.');
  } catch {
    return '-';
  }
}

/**
 * Convert hex state to readable state name
 */
function getStateFromHex(hex: string): string {
  const states: Record<string, string> = {
    '01': 'ESTABLISHED',
    '02': 'SYN_SENT',
    '03': 'SYN_RECV',
    '04': 'FIN_WAIT1',
    '05': 'FIN_WAIT2',
    '06': 'TIME_WAIT',
    '07': 'CLOSE',
    '08': 'CLOSE_WAIT',
    '09': 'LAST_ACK',
    '0A': 'LISTEN',
    '0B': 'CLOSING',
  };
  return states[hex.toUpperCase()] || 'UNKNOWN';
}

/**
 * Helper function to convert CIDR notation to netmask
 */
function cidrToNetmask(cidr: number): string {
  const mask = (0xffffffff ^ (Math.pow(2, 32 - cidr) - 1)) >>> 0;
  return [
    (mask >>> 24) & 255,
    (mask >>> 16) & 255,
    (mask >>> 8) & 255,
    mask & 255,
  ].join('.');
}

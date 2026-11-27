// Pass threshold is strictly 90%
const PASS_THRESHOLD = 90;

// Tree connections: [fromSectorId, toSectorId]
const TREE_EDGES = [
  ["fundamentals", "network"],
  ["fundamentals", "crypto"],
  ["fundamentals", "webapp"],
  ["network", "redteam"],
  ["network", "blueteam"],
  ["crypto", "webapp"],
  ["crypto", "blueteam"],
  ["webapp", "redteam"]
];

const SECTORS = [
  {
    id: "fundamentals",
    code: "SEC-01",
    title: "Fundamentals & Linux",
    desc: "Core security principles (CIA Triad), OS internals, Linux CLI, permissions, and process management.",
    pos: { x: 50, y: 16 },
    steps: [
      {
        id: "fund-1",
        title: "CIA Triad, Risk & Security Models",
        note: "Cybersecurity rests on three pillars: Confidentiality (only authorized users read data), Integrity (data is unaltered), and Availability (systems stay reachable). Risk = Threat × Vulnerability × Impact. Defense-in-Depth layers controls so one failure does not cause total compromise.",
        example: "A banking app uses TLS encryption so nobody on public Wi-Fi reads your password (Confidentiality), SHA-256 hashes so transfer amounts can't be tampered with in transit (Integrity), and redundant cloud servers so you can still pay bills during a DDoS attack (Availability).",
        videos: [
          { id: "f1-v1", title: "CIA Triad & Core Security Concepts", creator: "Professor Messer", url: "https://www.youtube.com/watch?v=83d3988999k&list=PLG49S3nxzAnl4QDVqK-hOnoqcSKEIDDHa" },
          { id: "f1-v2", title: "Risk, Threats & Vulnerabilities Explained", creator: "NetworkChuck", url: "https://www.youtube.com/c/NetworkChuck/playlists" }
        ],
        questions: [
          { topic: "CIA Triad", q: "Which pillar is violated when an attacker alters a wire transfer amount from $100 to $10,000 in transit?", opts: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"], ans: 1, exp: "Integrity guarantees data has not been modified without authorization." },
          { topic: "CIA Triad", q: "A ransomware attack encrypts a hospital's database, locking doctors out of patient records. Which pillar is primarily hit?", opts: ["Availability", "Confidentiality only", "Authentication", "Steganography"], ans: 0, exp: "Blocking legitimate users from accessing systems/data directly breaks Availability." },
          { topic: "Risk Management", q: "An unpatched Apache server exposed to the internet is an example of a:", opts: ["Threat Actor", "Vulnerability", "Countermeasure", "Asset"], ans: 1, exp: "A vulnerability is a weakness in a system that a threat can exploit." },
          { topic: "Defense-in-Depth", q: "Combining a firewall, MFA, endpoint antivirus, and network segmentation illustrates:", opts: ["Security through obscurity", "Single point of failure", "Defense-in-Depth", "Implicit trust"], ans: 2, exp: "Defense-in-Depth stacks independent security layers." },
          { topic: "Least Privilege", q: "Granting a junior intern read-only access to logs instead of full root access enforces:", opts: ["Principle of Least Privilege", "Availability", "Non-repudiation", "Hashing"], ans: 0, exp: "Users should only receive the minimum permissions needed for their job." }
        ]
      },
      {
        id: "fund-2",
        title: "Linux Filesystem, Permissions & Processes",
        note: "Linux powers most servers and security tools. Everything is a file under /. Permissions use r(4), w(2), x(1) for Owner, Group, Others. SUID bits execute binaries with the owner's privileges. Master grep, awk, chmod, chown, ps, and systemd.",
        example: "If an admin mistakenly runs 'chmod 777 /etc/shadow' or sets a SUID bit on '/usr/bin/vim', any normal user can read password hashes or spawn a root shell directly from vim—a classic Linux privilege escalation flaw.",
        videos: [
          { id: "f2-v1", title: "Linux for Hackers (Full Course)", creator: "NetworkChuck", url: "https://www.youtube.com/playlist?list=PLIhvC56v63IJIujb5cyE13oLuyORZpdkL" },
          { id: "f2-v2", title: "Linux Essentials & Permissions", creator: "The Cyber Mentor (TCM)", url: "https://www.youtube.com/@TCMSecurityAcademy/playlists" },
          { id: "f2-v3", title: "OverTheWire Bandit Walkthrough Concepts", creator: "John Hammond", url: "https://www.youtube.com/@_JohnHammond/search?query=bandit" }
        ],
        questions: [
          { topic: "Permissions", q: "What does 'chmod 750 script.sh' grant?", opts: ["rwx for owner, r-x for group, none for others", "rwx for everyone", "rw- for owner, r-- for group, r-- for others", "r-x for owner, rwx for group, none for others"], ans: 0, exp: "7 = rwx (4+2+1), 5 = r-x (4+1), 0 = ---." },
          { topic: "Filesystem", q: "Where are hashed local user passwords stored on modern Linux systems?", opts: ["/etc/passwd", "/etc/shadow", "/var/log/auth", "/root/hashes"], ans: 1, exp: "/etc/shadow stores password hashes and is readable only by root." },
          { topic: "Special Bits", q: "A binary with '-rwsr-xr-x' owned by root has which special permission set?", opts: ["Sticky Bit", "SGID", "SUID", "Immutable"], ans: 2, exp: "The 's' in the owner execute slot indicates SUID (runs with root's EUID)." },
          { topic: "Processes", q: "Which command shows all running processes with full command arguments?", opts: ["ls -la", "ps aux", "df -h", "cat /etc/hosts"], ans: 1, exp: "'ps aux' lists processes across all users with CPU/RAM and commands." },
          { topic: "CLI Piping", q: "How do you search recursively for the word 'API_KEY' inside /var/www ignoring case?", opts: ["grep -ri 'API_KEY' /var/www", "find 'API_KEY' /var/www", "chmod -R API_KEY /var/www", "sed /var/www API_KEY"], ans: 0, exp: "-r searches recursively and -i ignores case." },
          { topic: "Filesystem", q: "Which directory holds dynamic system and authentication logs?", opts: ["/bin", "/dev", "/var/log", "/boot"], ans: 2, exp: "/var/log stores system, web server, and auth logs." },
          { topic: "Permissions", q: "Which numeric value represents read and write without execute?", opts: ["5", "6", "7", "4"], ans: 1, exp: "Read (4) + Write (2) = 6." }
        ]
      },
      {
        id: "fund-3",
        title: "Bash Scripting & Automation for Security",
        note: "Automating repetitive recon, log parsing, and port sweeps saves hours. Core building blocks include shebang (#!/bin/bash), variables, loops (for/while), conditionals (if/[[ ]]), exit codes ($?), and stream redirection (>, 2>&1).",
        example: "Instead of manually checking 254 IP addresses in a subnet, a 4-line Bash 'for' loop with 'ping -c 1' and 'grep' sweeps the entire /24 network in seconds and writes live hosts to live_hosts.txt.",
        videos: [
          { id: "f3-v1", title: "Bash Scripting Full Course", creator: "NetworkChuck", url: "https://www.youtube.com/playlist?list=PLIhvC56v63IKioihj63h4y-3u352_8e6P" },
          { id: "f3-v2", title: "Bash for Pentesters", creator: "John Hammond", url: "https://www.youtube.com/@_JohnHammond/search?query=bash" }
        ],
        questions: [
          { topic: "Redirection", q: "What does '2>/dev/null' do in a Bash command?", opts: ["Saves output to null.txt", "Discards standard error (stderr) messages", "Redirects stdin", "Runs command as root"], ans: 1, exp: "File descriptor 2 is stderr; sending it to /dev/null silences errors." },
          { topic: "Variables", q: "In Bash, what does '$?' represent immediately after a command runs?", opts: ["Process ID", "Exit status of the last command", "Number of arguments", "Current username"], ans: 1, exp: "0 means success; non-zero indicates an error." },
          { topic: "Syntax", q: "What is the purpose of '#!/bin/bash' at line 1 of a script?", opts: ["It is a normal comment", "Shebang specifying the interpreter", "Grants execute permission", "Imports math library"], ans: 1, exp: "The shebang tells the OS which interpreter executes the script." },
          { topic: "Loops", q: "Which syntax correctly iterates over IPs listed in targets.txt?", opts: ["for ip in $(cat targets.txt); do ... done", "loop ip targets.txt", "foreach (ip) {}", "while targets.txt"], ans: 0, exp: "Command substitution $(cat ...) feeds each token into the for loop." },
          { topic: "Redirection", q: "What is the difference between '>' and '>>'?", opts: ["'>' appends, '>>' overwrites", "'>' overwrites, '>>' appends", "Both overwrite", "No difference"], ans: 1, exp: "Single '>' truncates/overwrites the file; '>>' appends to the end." }
        ]
      }
    ]
  },

  {
    id: "network",
    code: "SEC-02",
    title: "Network Security",
    desc: "TCP/IP, OSI Model, Subnetting, Wireshark packet analysis, Firewalls, VPNs, and MITM defenses.",
    pos: { x: 20, y: 50 },
    steps: [
      {
        id: "net-1",
        title: "OSI Model, TCP/IP & Subnetting (Deep Topic)",
        note: "Data travels through 7 OSI layers (Physical to Application). TCP guarantees delivery via a 3-way handshake (SYN, SYN-ACK, ACK); UDP is connectionless and fast. CIDR (/24, /26) defines network vs host bits for segmentation.",
        example: "When you open https://bank.com, DNS (UDP 53) resolves the IP, TCP (Layer 4) completes the 3-way handshake on port 443, TLS encrypts the session, and routers (Layer 3) forward packets across networks using IP headers.",
        videos: [
          { id: "n1-v1", title: "CompTIA Network+ Full Video Course", creator: "Professor Messer", url: "https://www.youtube.com/playlist?list=PLG49S3nxzAnlCJiCrOYuRYb6cne864a7G" },
          { id: "n1-v2", title: "You Suck at Subnetting (Best Visual Guide)", creator: "NetworkChuck", url: "https://www.youtube.com/playlist?list=PLIhvC56v63IKrRHh3gvZZBAGvsvOhwrRF" },
          { id: "n1-v3", title: "CCNA & Networking Fundamentals", creator: "David Bombal", url: "https://www.youtube.com/@davidbombal/playlists" }
        ],
        questions: [
          { topic: "OSI Model", q: "At which OSI layer do IP addresses and routers operate?", opts: ["Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 4 (Transport)", "Layer 7 (Application)"], ans: 1, exp: "Layer 3 handles logical addressing (IP) and routing." },
          { topic: "OSI Model", q: "MAC addresses and ARP operate at which OSI layer?", opts: ["Layer 1", "Layer 2", "Layer 3", "Layer 5"], ans: 1, exp: "Switches, frames, and MAC addresses live at Layer 2." },
          { topic: "TCP Handshake", q: "What is the exact sequence of flags in a standard TCP 3-way handshake?", opts: ["SYN -> ACK -> FIN", "SYN -> SYN-ACK -> ACK", "ACK -> SYN -> RST", "FIN -> ACK -> SYN"], ans: 1, exp: "Client sends SYN, server replies SYN-ACK, client confirms with ACK." },
          { topic: "Ports & Protocols", q: "Which default port and protocol does SSH use?", opts: ["TCP 21", "TCP 22", "UDP 53", "TCP 23"], ans: 1, exp: "SSH uses TCP port 22 (Telnet is 23, FTP is 21)." },
          { topic: "Ports & Protocols", q: "Which protocol is connectionless and commonly used for standard DNS queries?", opts: ["TCP", "UDP", "ICMP", "ARP"], ans: 1, exp: "Standard DNS queries use UDP port 53 for low overhead." },
          { topic: "Subnetting", q: "How many usable host IP addresses are in a /24 subnet?", opts: ["256", "254", "126", "512"], ans: 1, exp: "2^8 - 2 (network and broadcast addresses) = 254 usable hosts." },
          { topic: "Subnetting", q: "What is the subnet mask for CIDR /26?", opts: ["255.255.255.0", "255.255.255.128", "255.255.255.192", "255.255.255.240"], ans: 2, exp: "/26 borrows 2 bits in the last octet: 128 + 64 = 192." },
          { topic: "TCP Flags", q: "Which TCP flag immediately tears down a connection due to an error or closed port?", opts: ["PSH", "URG", "RST", "SYN"], ans: 2, exp: "RST (Reset) abruptly terminates a TCP session." },
          { topic: "Network Attacks", q: "Sending thousands of SYN packets without completing the final ACK causes a:", opts: ["ARP Spoof", "SYN Flood DoS", "SQL Injection", "DNS Poisoning"], ans: 1, exp: "Half-open connections exhaust the server's backlog table." },
          { topic: "OSI Model", q: "HTTP, SMTP, and DNS live at which OSI layer?", opts: ["Layer 4", "Layer 5", "Layer 6", "Layer 7"], ans: 3, exp: "End-user protocols operate at Layer 7 (Application)." }
        ]
      },
      {
        id: "net-2",
        title: "Packet Analysis with Wireshark & tcpdump",
        note: "Packet sniffers reveal the ground truth on the wire. Use capture filters (BPF) before recording and display filters (e.g., http.request, tcp.flags.syn==1, dns) to isolate anomalies, cleartext credentials, or C2 beacons.",
        example: "During an incident, opening a PCAP in Wireshark and filtering 'http.request.method == POST' immediately exposes a compromised workstation exfiltrating plaintext logins to an unknown foreign IP.",
        videos: [
          { id: "n2-v1", title: "Wireshark for Beginners & Hackers", creator: "David Bombal", url: "https://www.youtube.com/playlist?list=PLhfrWIlLOoKMe1Ue0IdeULegEgWqrjc1B" },
          { id: "n2-v2", title: "Packet Analysis & PCAP Challenges", creator: "John Hammond", url: "https://www.youtube.com/@_JohnHammond/search?query=wireshark" }
        ],
        questions: [
          { topic: "Display Filters", q: "Which Wireshark display filter shows only traffic to or from 10.0.0.5?", opts: ["ip.addr == 10.0.0.5", "host 10.0.0.5", "ip == 10.0.0.5", "src.ip = 10.0.0.5"], ans: 0, exp: "ip.addr matches either source or destination IP." },
          { topic: "Traffic Inspection", q: "Why can you read FTP passwords in Wireshark but not SSH passwords?", opts: ["FTP uses UDP", "FTP transmits credentials in plaintext; SSH encrypts them", "Wireshark blocks SSH", "SSH has no packets"], ans: 1, exp: "Unencrypted protocols expose payloads directly on the wire." },
          { topic: "tcpdump", q: "Which tcpdump flag saves captured packets to a .pcap file?", opts: ["-r", "-w", "-i", "-n"], ans: 1, exp: "-w writes raw packets to a file; -r reads from a file." },
          { topic: "Display Filters", q: "Which filter isolates TCP SYN packets without ACK (port scan detection)?", opts: ["tcp.flags.syn == 1 && tcp.flags.ack == 0", "tcp.syn == true", "tcp.port == 0", "icmp.type == 8"], ans: 0, exp: "Checking SYN=1 and ACK=0 isolates initial connection attempts." },
          { topic: "Stream Analysis", q: "To reconstruct an entire HTTP conversation in readable form inside Wireshark, you use:", opts: ["Ping Sweep", "Follow -> TCP Stream", "ARP Table", "Traceroute"], ans: 1, exp: "Follow TCP Stream reassembles segmented payloads in order." }
        ]
      },
      {
        id: "net-3",
        title: "Firewalls, IDS/IPS, VLANs & Zero Trust",
        note: "Stateful firewalls track active connections; NGFWs inspect Layer 7 payloads. IDS detects and alerts passively, while IPS sits inline to actively drop malicious traffic. VLANs and Zero Trust limit lateral movement inside a breach.",
        example: "If an attacker compromises a smart printer on an office network, VLAN segmentation blocks that printer from reaching the finance database server, turning a potential catastrophe into a contained alert.",
        videos: [
          { id: "n3-v1", title: "Firewalls, IDS, IPS & Network Security", creator: "Professor Messer", url: "https://www.youtube.com/@professormesser/search?query=firewall%20ids%20ips" },
          { id: "n3-v2", title: "Zero Trust Architecture Explained", creator: "IBM Technology", url: "https://www.youtube.com/@IBMTechnology/search?query=zero%20trust" }
        ],
        questions: [
          { topic: "IDS vs IPS", q: "What is the key operational difference between an IDS and an IPS?", opts: ["IDS encrypts traffic", "IPS sits inline and actively blocks malicious traffic; IDS only alerts", "IDS is faster than firewalls", "IPS only works on Wi-Fi"], ans: 1, exp: "IPS prevents/drops attacks inline; IDS monitors and alerts." },
          { topic: "Firewalls", q: "What is the security principle behind placing an implicit 'Deny All' rule at the bottom of a firewall ACL?", opts: ["Block everything not explicitly allowed", "Allow all outbound traffic", "Speed up DNS", "Prevent hardware overheating"], ans: 0, exp: "Default-deny ensures unknown/unapproved traffic is blocked." },
          { topic: "Segmentation", q: "Which technology logically separates broadcast domains on the same physical switch?", opts: ["NAT", "VLAN", "DHCP", "SNMP"], ans: 1, exp: "VLANs (802.1Q) isolate Layer 2 traffic on shared hardware." },
          { topic: "Zero Trust", q: "Which phrase best summarizes Zero Trust Architecture?", opts: ["Trust internal network, block external", "Never trust, always verify", "Encrypt only passwords", "Disable all firewalls"], ans: 1, exp: "Zero Trust verifies every user, device, and request regardless of network location." },
          { topic: "DMZ", q: "Where should a public-facing web server be placed to protect the internal LAN?", opts: ["Inside the Domain Controller", "In a DMZ (Screened Subnet)", "On the guest Wi-Fi", "Directly on the HR VLAN"], ans: 1, exp: "A DMZ isolates public-facing services from internal corporate assets." }
        ]
      }
    ]
  },

  {
    id: "crypto",
    code: "SEC-03",
    title: "Cryptography & PKI",
    desc: "Symmetric/Asymmetric encryption, Hashing & Salting, Digital Signatures, TLS/HTTPS, and Certificates.",
    pos: { x: 50, y: 50 },
    steps: [
      {
        id: "cry-1",
        title: "Symmetric vs Asymmetric Encryption",
        note: "Symmetric encryption (AES-256, ChaCha20) uses one shared secret key—blazing fast for bulk data, but hard to share keys safely. Asymmetric encryption (RSA, ECC) uses a public/private key pair—slower, but solves key exchange.",
        example: "HTTPS uses hybrid encryption: RSA/ECDHE (asymmetric) safely agrees on a one-time session key over the open internet, then AES-GCM (symmetric) encrypts your entire Netflix stream or banking session at gigabit speed.",
        videos: [
          { id: "c1-v1", title: "Public Key Cryptography & Diffie-Hellman", creator: "Computerphile", url: "https://www.youtube.com/playlist?list=PLzH6n4zXuckp1Rw5e-4eJ4M1hS1a-X5tK" },
          { id: "c1-v2", title: "Encryption & PKI Concepts", creator: "Professor Messer", url: "https://www.youtube.com/@professormesser/search?query=cryptography" }
        ],
        questions: [
          { topic: "Symmetric", q: "Which algorithm is the modern standard for symmetric bulk encryption?", opts: ["RSA", "AES", "SHA-256", "Diffie-Hellman"], ans: 1, exp: "AES (Advanced Encryption Standard) is the standard symmetric cipher." },
          { topic: "Asymmetric", q: "To send a confidential message to Alice using asymmetric crypto, which key do you encrypt with?", opts: ["Your private key", "Alice's public key", "Alice's private key", "A SHA-1 hash"], ans: 1, exp: "Encrypting with Alice's public key ensures only Alice's private key can decrypt it." },
          { topic: "Hybrid Crypto", q: "Why does TLS not use RSA to encrypt the entire web page payload?", opts: ["RSA is insecure", "Asymmetric math is too computationally slow for bulk data", "RSA only works on emails", "Browsers block RSA"], ans: 1, exp: "Asymmetric crypto is used for key exchange; symmetric AES handles bulk traffic." },
          { topic: "Key Exchange", q: "Which protocol allows two parties to establish a shared secret over an insecure channel?", opts: ["MD5", "Diffie-Hellman", "Base64", "ICMP"], ans: 1, exp: "Diffie-Hellman (and ECDHE) securely derives a shared secret." },
          { topic: "Encoding vs Encryption", q: "Is Base64 a form of encryption?", opts: ["Yes, symmetric", "Yes, asymmetric", "No, it is reversible encoding with no secret key", "Only when combined with HTTP"], ans: 2, exp: "Base64 provides zero confidentiality—anyone can decode it." }
        ]
      },
      {
        id: "cry-2",
        title: "Hashing, Salting & Password Storage",
        note: "Cryptographic hashes (SHA-256) are one-way deterministic fingerprints. Never store passwords with raw SHA-256 or broken MD5—use slow, salted Key Derivation Functions like Argon2id or bcrypt to defeat GPU cracking and rainbow tables.",
        example: "If two users both pick 'Password123', raw hashing produces identical hashes. Adding a unique random Salt per user creates completely different hashes, making precomputed rainbow tables useless.",
        videos: [
          { id: "c2-v1", title: "How NOT to Store Passwords (Hashing & Salting)", creator: "Computerphile", url: "https://www.youtube.com/watch?v=8ZtInClXe1Q" },
          { id: "c2-v2", title: "Password Cracking & Hashcat Intro", creator: "John Hammond", url: "https://www.youtube.com/@_JohnHammond/search?query=hashcat" }
        ],
        questions: [
          { topic: "Hashing", q: "What defines a cryptographic hash function?", opts: ["Reversible with a key", "One-way, fixed-length output, collision-resistant", "Compresses files like ZIP", "Encrypts Wi-Fi"], ans: 1, exp: "Hashes cannot be reversed and produce fixed-size digests." },
          { topic: "Salting", q: "What attack is directly defeated by adding a unique random salt to every password before hashing?", opts: ["SQL Injection", "Rainbow Table attacks", "DDoS", "ARP Spoofing"], ans: 1, exp: "Unique salts invalidate precomputed hash lookup tables." },
          { topic: "Password KDFs", q: "Which algorithm is best suited for storing user passwords in a database?", opts: ["MD5", "SHA-1", "Argon2id / bcrypt", "Base64"], ans: 2, exp: "Argon2id and bcrypt are intentionally slow and memory-hard against GPU cracking." },
          { topic: "Integrity", q: "Why do Linux ISOs publish a SHA-256 checksum on their download page?", opts: ["To encrypt the ISO", "So users can verify the file wasn't corrupted or trojanized", "To speed up downloads", "To bypass firewalls"], ans: 1, exp: "Matching the SHA-256 hash confirms file integrity." },
          { topic: "Collisions", q: "Why is MD5 considered broken for security?", opts: ["Output is too long", "Attackers can practically generate hash collisions", "It requires a private key", "It only runs on Windows"], ans: 1, exp: "Two different files can be crafted to produce the exact same MD5 hash." }
        ]
      },
      {
        id: "cry-3",
        title: "PKI, Digital Signatures & TLS Handshake",
        note: "Digital signatures hash a message and sign it with the sender's private key—proving authenticity, integrity, and non-repudiation. Certificate Authorities (CAs) sign X.509 certificates so browsers trust that a public key truly belongs to a domain.",
        example: "When you visit github.com, your browser checks its built-in Root CA store to verify GitHub's X.509 certificate signature. If a cafe Wi-Fi attacker swaps in a fake certificate, your browser throws a giant red TLS warning.",
        videos: [
          { id: "c3-v1", title: "How HTTPS & TLS Handshake Actually Work", creator: "ByteByteGo", url: "https://www.youtube.com/watch?v=j9QmMEWmcfo" },
          { id: "c3-v2", title: "Digital Signatures Explained", creator: "Computerphile", url: "https://www.youtube.com/watch?v=s22eJ1eVLTU" }
        ],
        questions: [
          { topic: "Digital Signatures", q: "How is a digital signature created?", opts: ["Encrypt message with receiver's public key", "Sign the message hash with the sender's private key", "Hash with MD5 only", "Compress with gzip"], ans: 1, exp: "Signing the hash with the sender's private key proves origin and integrity." },
          { topic: "PKI", q: "What is the role of a Certificate Authority (CA)?", opts: ["Store user passwords", "Verify identity and digitally sign public key certificates", "Route IP packets", "Block malware"], ans: 1, exp: "CAs bind a domain/entity's identity to its public key." },
          { topic: "Revocation", q: "If a company's private TLS key is stolen, what mechanism tells browsers to stop trusting that certificate?", opts: ["DNS A Record", "CRL / OCSP", "DHCP Lease", "SSH Agent"], ans: 1, exp: "Certificate Revocation Lists (CRL) and OCSP flag revoked certs." },
          { topic: "Non-repudiation", q: "Which security property stops a sender from denying they signed a document?", opts: ["Availability", "Non-repudiation", "Obfuscation", "Salting"], ans: 1, exp: "Only the holder of the private key could have generated the valid signature." },
          { topic: "TLS", q: "What does Perfect Forward Secrecy (PFS) guarantee?", opts: ["Past recorded traffic cannot be decrypted even if the server's long-term private key is later stolen", "Zero latency", "No certificates needed", "Passwords never expire"], ans: 0, exp: "Ephemeral session keys (ECDHE) protect historical captures." }
        ]
      }
    ]
  },

  {
    id: "webapp",
    code: "SEC-04",
    title: "Web Application Security",
    desc: "HTTP internals, Burp Suite, OWASP Top 10 (SQLi, XSS, IDOR, CSRF, SSRF), Auth & API security.",
    pos: { x: 80, y: 50 },
    steps: [
      {
        id: "web-1",
        title: "HTTP, Cookies, Sessions & Burp Suite",
        note: "Web security starts with reading raw HTTP requests/responses: methods (GET/POST/PUT), headers, status codes, and cookies. Burp Suite acts as an intercepting proxy between your browser and the server so you can inspect and tamper with every parameter.",
        example: "An e-commerce checkout page hides 'price=500' in a form field. Intercepting the POST request in Burp Suite and changing it to 'price=1' tests whether the server blindly trusts client-side data.",
        videos: [
          { id: "w1-v1", title: "PortSwigger Web Security Academy (Free Labs)", creator: "PortSwigger", url: "https://portswigger.net/web-security" },
          { id: "w1-v2", title: "Burp Suite Beginner to Pro", creator: "The Cyber Mentor / Rana Khalil", url: "https://www.youtube.com/@RanaKhalil101/playlists" }
        ],
        questions: [
          { topic: "Cookies", q: "Which cookie flag prevents JavaScript (document.cookie) from reading a session token?", opts: ["Secure", "HttpOnly", "SameSite=None", "Path=/"], ans: 1, exp: "HttpOnly blocks client-side JS access, mitigating session theft via XSS." },
          { topic: "Cookies", q: "Which cookie flag ensures the browser only sends the cookie over HTTPS?", opts: ["Secure", "HttpOnly", "Domain", "Max-Age"], ans: 0, exp: "The Secure attribute restricts transmission to encrypted HTTPS connections." },
          { topic: "HTTP", q: "What does HTTP status code 403 Forbidden mean?", opts: ["Page does not exist", "Server understood request but refuses to authorize it", "Internal server crash", "Permanent redirect"], ans: 1, exp: "403 indicates authenticated or unauthenticated access is explicitly denied." },
          { topic: "Proxy", q: "Why must you install Burp Suite's CA certificate in your browser?", opts: ["To speed up page loads", "So Burp can decrypt and inspect HTTPS traffic without browser errors", "To bypass login forms", "To block ads"], ans: 1, exp: "Burp performs a local TLS MITM using its own CA cert." },
          { topic: "CORS", q: "What does 'Access-Control-Allow-Origin: *' allow?", opts: ["Any website can read public responses from this API", "SQL queries from browsers", "Root SSH access", "Passwordless login"], ans: 0, exp: "Wildcard CORS permits cross-origin reads from any domain." }
        ]
      },
      {
        id: "web-2",
        title: "OWASP Top 10: SQLi, XSS, IDOR & CSRF (Deep Topic)",
        note: "Injection flaws occur when untrusted input is executed as code. SQLi manipulates database queries; XSS injects JavaScript into victims' browsers; IDOR lets users access another user's object by changing an ID (e.g. /invoice/102 -> /invoice/103); CSRF tricks a logged-in user's browser into sending forged requests.",
        example: "If a login query concatenates input directly: \"SELECT * FROM users WHERE user='\" + input + \"'\", typing \"admin' --\" comments out the password check and logs the attacker in as admin. Parameterized queries (prepared statements) fix this completely.",
        videos: [
          { id: "w2-v1", title: "SQL Injection Full Lab Walkthroughs", creator: "Rana Khalil", url: "https://www.youtube.com/playlist?list=PLuyTk2_mYISLaZC4fFqL_Mh6z0f-3e0e1" },
          { id: "w2-v2", title: "Web Exploitation & XSS Deep Dive", creator: "LiveOverflow", url: "https://www.youtube.com/@LiveOverflow/playlists" },
          { id: "w2-v3", title: "OWASP Top 10 Explained Visually", creator: "InsiderPhD", url: "https://www.youtube.com/@InsiderPhD/playlists" }
        ],
        questions: [
          { topic: "SQL Injection", q: "What is the primary defense against SQL Injection?", opts: ["Blacklisting the word SELECT", "Parameterized Queries (Prepared Statements)", "Using HTTPS", "Hiding the login URL"], ans: 1, exp: "Prepared statements strictly separate SQL code from user-supplied data." },
          { topic: "XSS", q: "Which type of XSS is permanently saved in the target database (e.g. a comment section) and runs for every visitor?", opts: ["Reflected XSS", "Stored XSS", "Blind SQLi", "Self-XSS"], ans: 1, exp: "Stored (Persistent) XSS is saved server-side and served to other users." },
          { topic: "XSS Defense", q: "How do you prevent XSS when rendering user input into HTML?", opts: ["Context-aware output encoding & CSP", "Base64 encoding passwords", "Using POST instead of GET", "Disabling cookies"], ans: 0, exp: "Encoding special HTML chars (<, >, \") and enforcing CSP neutralizes injected scripts." },
          { topic: "IDOR", q: "Changing '/api/orders/501' to '/api/orders/502' and viewing another customer's address is an example of:", opts: ["XSS", "IDOR / Broken Object Level Authorization", "CSRF", "SSRF"], ans: 1, exp: "IDOR occurs when the server fails to verify ownership of the requested object ID." },
          { topic: "CSRF", q: "Which two defenses effectively stop Cross-Site Request Forgery (CSRF)?", opts: ["MD5 and Base64", "Anti-CSRF tokens and SameSite=Lax/Strict cookies", "HTTPS and HSTS", "Firewalls and NAT"], ans: 1, exp: "Unpredictable per-session tokens and SameSite cookies block forged cross-site requests." },
          { topic: "SSRF", q: "An attacker supplies 'http://169.254.169.254/latest/meta-data/' to a server's 'Fetch URL from web' feature. What vulnerability is this?", opts: ["XSS", "SSRF (Server-Side Request Forgery)", "Clickjacking", "SQLi"], ans: 1, exp: "SSRF tricks the server into making internal requests (like hitting cloud metadata)." },
          { topic: "SQL Injection", q: "In SQLi, what does the '--' or '#' payload typically do?", opts: ["Encrypts the query", "Comments out the remainder of the original SQL query", "Deletes the table", "Escapes HTML"], ans: 1, exp: "SQL comment syntax ignores trailing password checks or quotes." },
          { topic: "Broken Access Control", q: "Hiding an 'Admin Panel' button in React frontend code without checking roles on the backend API is:", opts: ["Secure", "Broken Access Control (client-side only enforcement)", "CSRF protection", "Zero Trust"], ans: 1, exp: "Authorization must always be enforced server-side." }
        ]
      },
      {
        id: "web-3",
        title: "Authentication, JWT & API Security",
        note: "Modern apps rely on REST/GraphQL APIs and JSON Web Tokens (JWT = Header.Payload.Signature). Common flaws include weak JWT secrets, 'alg: none' bypasses, missing rate limits (brute force), and Mass Assignment (sending isAdmin: true in JSON).",
        example: "A user updates their profile with {\"name\":\"Alex\"}. An attacker modifies the JSON body to {\"name\":\"Alex\", \"role\":\"admin\"}. Because the backend blindly binds JSON fields to the database model, the attacker becomes an admin.",
        videos: [
          { id: "w3-v1", title: "JWT Attacks & Hacking APIs", creator: "STÖK / Rana Khalil", url: "https://www.youtube.com/results?search_query=jwt+attacks+portswigger+walkthrough" },
          { id: "w3-v2", title: "API Security & Bug Bounty Methodology", creator: "NahamSec", url: "https://www.youtube.com/@NahamSec/playlists" }
        ],
        questions: [
          { topic: "JWT", q: "What are the three Base64URL-encoded parts of a JWT?", opts: ["User.Pass.Token", "Header.Payload.Signature", "Salt.Hash.Key", "Method.Path.Body"], ans: 1, exp: "JWTs consist of Header, Payload (claims), and Signature separated by dots." },
          { topic: "JWT Security", q: "Why should sensitive secrets (like passwords) never be placed inside a standard JWT payload?", opts: ["JWT payloads are only Base64URL encoded, not encrypted", "JWTs are too small", "Browsers delete them", "SQL can't read them"], ans: 0, exp: "Anyone can decode a JWT payload without the secret key." },
          { topic: "Mass Assignment", q: "Submitting an unexpected JSON field like 'isAdmin: true' on a profile update endpoint exploits:", opts: ["XSS", "Mass Assignment", "SSRF", "Buffer Overflow"], ans: 1, exp: "Allow-listing permitted fields prevents Mass Assignment." },
          { topic: "Brute Force", q: "What is the best control against credential stuffing and password brute forcing on /api/login?", opts: ["Rate limiting, account lockout, and MFA", "Using Base64", "Longer URLs", "Disabling HTTPS"], ans: 0, exp: "Rate limits and MFA stop automated login spraying." },
          { topic: "JWT Attacks", q: "What happens if a vulnerable JWT library accepts 'alg: none' in the token header?", opts: ["Token expires immediately", "Attacker can forge arbitrary claims without a valid signature", "Server crashes", "Password resets"], ans: 1, exp: "Accepting 'none' disables signature verification completely." }
        ]
      }
    ]
  },

  {
    id: "redteam",
    code: "SEC-05",
    title: "Pentesting (Red Team)",
    desc: "Reconnaissance, Nmap scanning, Exploitation, Privilege Escalation, Active Directory, and Reporting.",
    pos: { x: 32, y: 84 },
    steps: [
      {
        id: "red-1",
        title: "Reconnaissance, Enumeration & Nmap",
        note: "80% of pentesting is enumeration. Passive recon gathers OSINT (WHOIS, crt.sh, Shodan) without touching the target. Active recon uses Nmap (-sC -sV -p-), gobuster/ffuf for web directories, and enum4linux for SMB shares.",
        example: "Instead of blindly firing exploits, running 'nmap -sC -sV -p- 10.10.10.5' reveals an outdated SMB share with anonymous guest login containing a forgotten backup zip with SSH keys.",
        videos: [
          { id: "r1-v1", title: "Practical Ethical Hacking & Recon", creator: "The Cyber Mentor (TCM)", url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE" },
          { id: "r1-v2", title: "Hack The Box Real Walkthroughs", creator: "IppSec", url: "https://www.youtube.com/@ippsec/videos" }
        ],
        questions: [
          { topic: "Recon Types", q: "Checking certificate transparency logs (crt.sh) for subdomains is an example of:", opts: ["Active Exploitation", "Passive Reconnaissance", "Privilege Escalation", "Post-Exploitation"], ans: 1, exp: "Passive recon queries third-party sources without directly probing the target." },
          { topic: "Nmap", q: "What do the Nmap flags '-sV -sC' do?", opts: ["Stealth UDP scan only", "Service version detection and default NSE scripts", "OS shutdown", "Vulnerability patching"], ans: 1, exp: "-sV probes versions; -sC runs safe default discovery scripts." },
          { topic: "Nmap", q: "Why is '-p-' important during a thorough pentest?", opts: ["Scans only top 10 ports", "Scans all 65,535 TCP ports instead of just the default 1,000", "Disables ping", "Outputs XML"], ans: 1, exp: "Services often hide on high non-standard ports outside the top 1,000." },
          { topic: "Web Fuzzing", q: "Tools like ffuf and gobuster are primarily used for:", opts: ["Cracking Wi-Fi", "Discovering hidden web directories, files, and vhosts", "Packet sniffing", "Compiling C code"], ans: 1, exp: "They brute-force paths and subdomains using wordlists." },
          { topic: "Methodology", q: "Before scanning any external IP address in a real engagement, what is legally mandatory?", opts: ["A fast VPN", "Written Scope & Rules of Engagement (Authorization)", "Kali Linux", "Metasploit Pro"], ans: 1, exp: "Unauthorized scanning/testing is illegal; always get written permission." }
        ]
      },
      {
        id: "red-2",
        title: "Exploitation, Shells & Privilege Escalation (Deep Topic)",
        note: "Once a vulnerability is confirmed, attackers establish a reverse shell (target connects back to attacker) to bypass inbound firewalls. Privilege Escalation turns a low-level foothold (www-data) into root/SYSTEM via sudo misconfigs (GTFOBins), SUID binaries, cron jobs, kernel flaws, or unquoted service paths.",
        example: "After getting a shell as 'www-data', running 'sudo -l' shows the user can run '/usr/bin/find' as root without a password. Checking GTFOBins gives a one-liner that spawns a root shell in 2 seconds.",
        videos: [
          { id: "r2-v1", title: "Linux & Windows Privilege Escalation", creator: "The Cyber Mentor (TCM)", url: "https://www.youtube.com/@TCMSecurityAcademy/search?query=privilege%20escalation" },
          { id: "r2-v2", title: "Reverse Shells & Post-Exploitation", creator: "John Hammond", url: "https://www.youtube.com/@_JohnHammond/search?query=reverse%20shell" }
        ],
        questions: [
          { topic: "Shells", q: "Why are Reverse Shells usually preferred over Bind Shells?", opts: ["Reverse shells bypass inbound firewall rules by initiating outbound from the target", "Bind shells don't work on Linux", "Reverse shells need no IP", "Bind shells are encrypted by default"], ans: 0, exp: "Firewalls usually block inbound ports but allow outbound traffic (like 443)." },
          { topic: "Linux PrivEsc", q: "What is the first command pentesters run to check which commands the current user can execute as root?", opts: ["whoami /all", "sudo -l", "ifconfig", "ping localhost"], ans: 1, exp: "'sudo -l' lists permitted sudo rules for the current user." },
          { topic: "Linux PrivEsc", q: "What is GTFOBins used for?", opts: ["Download Linux ISOs", "Catalog of legitimate Unix binaries that can be abused to bypass restrictions or escalate privileges", "Scan open ports", "Generate SSL certs"], ans: 1, exp: "GTFOBins documents how binaries like vim, find, or python can spawn shells." },
          { topic: "Linux PrivEsc", q: "A root-owned cron job runs '/opt/backup.sh' every minute, and the script is world-writable (777). How can an attacker escalate?", opts: ["Delete /etc/passwd", "Append a reverse shell or SUID bash command into /opt/backup.sh", "Restart the router", "Run nmap"], ans: 1, exp: "When root executes the modified script, the attacker's payload runs as root." },
          { topic: "Windows PrivEsc", q: "Which Windows privilege allows token impersonation attacks like PrintSpoofer or JuicyPotato?", opts: ["SeShutdownPrivilege", "SeImpersonatePrivilege", "SeTimeZonePrivilege", "SeChangeNotifyPrivilege"], ans: 1, exp: "Service accounts with SeImpersonatePrivilege can often escalate to NT AUTHORITY\\SYSTEM." },
          { topic: "Enumeration Tools", q: "What do linPEAS and winPEAS automate?", opts: ["Brute-forcing logins", "Enumerating local privilege escalation vectors on Linux/Windows", "Building phishing sites", "Encrypting hard drives"], ans: 1, exp: "PEAS scripts rapidly highlight misconfigurations, credentials, and PrivEsc paths." },
          { topic: "Shell Stability", q: "Why do pentesters upgrade a raw netcat shell using Python's pty module?", opts: ["To get a full interactive TTY (tab completion, Ctrl+C without killing shell, su/sudo support)", "To make it faster", "To hide from antivirus", "To change IP"], ans: 0, exp: "Raw shells lack interactive terminal features needed for tools like su/ssh." }
        ]
      },
      {
        id: "red-3",
        title: "Active Directory Attacks & Pentest Reporting",
        note: "Most enterprises run Active Directory (AD). Attackers map attack paths with BloodHound, abuse Kerberos (AS-REP Roasting, Kerberoasting), and move laterally with Pass-the-Hash. A pentest is only valuable when backed by a clear report: Executive Summary, Technical Reproduction Steps, CVSS Risk, and Remediation.",
        example: "Kerberoasting requests a Kerberos service ticket (TGS) for an account with a Service Principal Name (SPN) and cracks its weak password offline with Hashcat—without triggering loud account lockouts.",
        videos: [
          { id: "r3-v1", title: "Active Directory Attacks & Lab Build", creator: "The Cyber Mentor (TCM)", url: "https://www.youtube.com/@TCMSecurityAcademy/search?query=active%20directory" },
          { id: "r3-v2", title: "Active Directory & BloodHound Explained", creator: "IppSec", url: "https://www.youtube.com/@ippsec/search?query=bloodhound" }
        ],
        questions: [
          { topic: "Active Directory", q: "What does BloodHound visualize in an Active Directory environment?", opts: ["Firewall rules", "Graph attack paths between users, groups, sessions, and Domain Admin", "Web vulnerabilities", "Network bandwidth"], ans: 1, exp: "BloodHound uses graph theory to reveal hidden AD privilege paths." },
          { topic: "Kerberos", q: "Kerberoasting targets service accounts that have which attribute configured?", opts: ["SPN (Service Principal Name)", "MAC Address", "SSH Key", "HttpOnly"], ans: 0, exp: "Any domain user can request TGS tickets for accounts with an SPN and crack them offline." },
          { topic: "Lateral Movement", q: "What does Pass-the-Hash (PtH) allow an attacker to do?", opts: ["Authenticate to remote Windows systems using a stolen NTLM hash without knowing the plaintext password", "Crack SHA-256 instantly", "Bypass TLS", "Scan ports"], ans: 0, exp: "NTLM authentication accepts the hash directly." },
          { topic: "Reporting", q: "Which section of a pentest report is written specifically for C-level executives and non-technical leadership?", opts: ["Raw Nmap Output", "Executive Summary", "Exploit Python Code", "Appendix"], ans: 1, exp: "The Executive Summary communicates business risk and strategic priorities." },
          { topic: "Remediation", q: "What makes a technical finding actionable for developers?", opts: ["Only posting a screenshot", "Exact reproduction steps, impact, and concrete code/config remediation", "Using scary jargon", "Omitting affected URLs"], ans: 1, exp: "Clear repro steps and fixes let defenders patch and verify quickly." }
        ]
      }
    ]
  },

  {
    id: "blueteam",
    code: "SEC-06",
    title: "SOC & Blue Team Defense",
    desc: "Log analysis, SIEM (Splunk/Elastic), MITRE ATT&CK, Incident Response (PICERL), and Threat Hunting.",
    pos: { x: 68, y: 84 },
    steps: [
      {
        id: "blue-1",
        title: "Log Analysis, Windows Event IDs & SIEM (Deep Topic)",
        note: "Defenders rely on telemetry. A SIEM (Splunk, Wazuh, Microsoft Sentinel) centralizes logs from endpoints, firewalls, and AD to correlate alerts. Key Windows Event IDs: 4624 (Logon), 4625 (Failed Logon), 4688/Sysmon 1 (Process Creation), 4720 (User Created), 1102 (Audit Log Cleared).",
        example: "A SIEM correlation rule sees 400 Event ID 4625s (failed logins) from one IP in 2 minutes followed by a single 4624 (success) and a Sysmon Event 1 spawning encoded PowerShell—instantly paging the SOC analyst to isolate the host.",
        videos: [
          { id: "b1-v1", title: "SOC Analyst Training & SIEM Fundamentals", creator: "Black Hills InfoSec", url: "https://www.youtube.com/@BlackHillsInformationSecurity/playlists" },
          { id: "b1-v2", title: "Blue Team & Splunk / Log Analysis", creator: "John Hammond / Simply Cyber", url: "https://www.youtube.com/@SimplyCyber/playlists" }
        ],
        questions: [
          { topic: "Windows Events", q: "Which Windows Security Event ID logs a FAILED logon attempt?", opts: ["4624", "4625", "4720", "1102"], ans: 1, exp: "4625 = Failed Logon; 4624 = Successful Logon." },
          { topic: "Windows Events", q: "An attacker wipes the Windows Security Event Log to hide their tracks. Which Event ID is generated?", opts: ["4624", "1102", "4688", "7045"], ans: 1, exp: "Event ID 1102 records that the audit log was cleared—a high-severity alert." },
          { topic: "Sysmon", q: "Why do SOC teams deploy Sysmon alongside default Windows logs?", opts: ["It replaces firewalls", "It provides deep telemetry like process command lines, file hashes, and network connections", "It encrypts files", "It patches Windows"], ans: 1, exp: "Sysmon enriches endpoint visibility dramatically for threat hunting." },
          { topic: "SIEM", q: "What is the core function of a SIEM?", opts: ["Compile malware", "Aggregate, normalize, and correlate logs from multiple sources to detect threats", "Replace backups", "Block spam emails only"], ans: 1, exp: "SIEMs turn scattered raw logs into correlated security alerts." },
          { topic: "Alert Triage", q: "An alert fires for malicious activity, and investigation confirms an actual breach is occurring. This alert is a:", opts: ["False Positive", "True Positive", "False Negative", "Benign Negative"], ans: 1, exp: "True Positive = Alert fired AND real threat exists." },
          { topic: "Alert Triage", q: "An attacker compromises a server, and the SIEM produces ZERO alerts. This is a:", opts: ["True Positive", "False Positive", "False Negative", "True Negative"], ans: 2, exp: "False Negative = Real attack missed by detection controls." },
          { topic: "Linux Logs", q: "On Ubuntu/Debian servers, which log file records SSH login attempts and sudo usage?", opts: ["/var/log/auth.log", "/etc/hosts", "/tmp/ssh.txt", "/boot/grub.cfg"], ans: 0, exp: "/var/log/auth.log tracks authentication and sudo events." }
        ]
      },
      {
        id: "blue-2",
        title: "MITRE ATT&CK & Cyber Kill Chain",
        note: "MITRE ATT&CK is a globally standardized knowledge base of adversary Tactics (the 'why', e.g., Persistence, Lateral Movement) and Techniques (the 'how', e.g., T1059 Command & Scripting Interpreter). SOC teams map detections against ATT&CK to find blind spots.",
        example: "When an attacker drops a malicious Scheduled Task to survive reboots, a SOC analyst maps it to Tactic: Persistence, Technique: T1053.005 (Scheduled Task), and builds a permanent detection rule for that technique across all endpoints.",
        videos: [
          { id: "b2-v1", title: "MITRE ATT&CK Framework Explained", creator: "IBM Technology / Gerald Auger", url: "https://www.youtube.com/results?search_query=mitre+attack+framework+explained" },
          { id: "b2-v2", title: "Threat Hunting with MITRE ATT&CK", creator: "Black Hills InfoSec", url: "https://www.youtube.com/@BlackHillsInformationSecurity/search?query=mitre" }
        ],
        questions: [
          { topic: "MITRE ATT&CK", q: "In MITRE ATT&CK, what is the difference between a Tactic and a Technique?", opts: ["Tactic = adversary's goal (why); Technique = specific method used (how)", "They mean the exact same thing", "Tactics are for Blue Team only", "Techniques are only malware hashes"], ans: 0, exp: "Tactics are high-level objectives; Techniques are the concrete actions." },
          { topic: "Pyramid of Pain", q: "According to David Bianco's Pyramid of Pain, which indicator is HARDEST for attackers to change?", opts: ["File Hashes (MD5/SHA256)", "IP Addresses", "Domain Names", "TTPs (Tactics, Techniques, and Procedures)"], ans: 3, exp: "Attackers can flip hashes/IPs in seconds, but changing core TTPs is costly." },
          { topic: "Indicators", q: "A malicious file's SHA-256 hash and C2 IP address are examples of:", opts: ["IoCs (Indicators of Compromise)", "Firewall rules", "Patch levels", "SLAs"], ans: 0, exp: "IoCs are forensic artifacts showing evidence of an intrusion." },
          { topic: "MITRE Tactics", q: "Using Mimikatz to dump LSASS memory for passwords falls under which ATT&CK Tactic?", opts: ["Credential Access", "Initial Access", "Exfiltration", "Resource Development"], ans: 0, exp: "Extracting passwords/hashes maps to Credential Access (T1003)." },
          { topic: "Detection Engineering", q: "Why is detecting behavior (TTPs) better than only blocking static hashes?", opts: ["Changing 1 byte in malware changes its hash, bypassing hash blocks", "Hashes are slower", "TTPs don't need logs", "Firewalls don't support hashes"], ans: 0, exp: "Behavioral rules catch modified variants of the same attack." }
        ]
      },
      {
        id: "blue-3",
        title: "Incident Response (PICERL) & Containment",
        note: "Follow the 6-phase SANS PICERL lifecycle: Preparation, Identification, Containment, Eradication, Recovery, and Lessons Learned. Never immediately wipe or power off a compromised machine before capturing volatile memory (RAM) if forensics are needed—network-isolate it first.",
        example: "When ransomware hits a laptop, EDR immediately isolates it from the network (Containment) so it can't encrypt shared drives, while keeping it powered on so responders can dump RAM and identify the initial phishing email (Eradication).",
        videos: [
          { id: "b3-v1", title: "Incident Response Process (PICERL)", creator: "Professor Messer", url: "https://www.youtube.com/@professormesser/search?query=incident%20response" },
          { id: "b3-v2", title: "Real-World Incident Response & DFIR", creator: "13Cubed", url: "https://www.youtube.com/@13Cubed/playlists" }
        ],
        questions: [
          { topic: "IR Lifecycle", q: "What is the correct order of the SANS PICERL Incident Response phases?", opts: ["Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned", "Containment, Preparation, Recovery, Identification", "Identification, Eradication, Containment, Preparation", "Recovery, Lessons Learned, Identification"], ans: 0, exp: "PICERL: Prep -> Identify -> Contain -> Eradicate -> Recover -> Lessons Learned." },
          { topic: "Containment", q: "What is the immediate goal of the Containment phase?", opts: ["Write the final report", "Stop the attack from spreading further while preserving evidence", "Format all company servers", "Hire new staff"], ans: 1, exp: "Containment limits blast radius (e.g., EDR host isolation, disabling compromised accounts)." },
          { topic: "Order of Volatility", q: "When collecting forensic evidence, which data should be captured FIRST because it disappears fastest?", opts: ["Hard drive sectors", "RAM / CPU registers & running network connections", "Archival tape backups", "Printed logs"], ans: 1, exp: "Volatile memory (RAM) vanishes on reboot and holds decrypted payloads/keys." },
          { topic: "Eradication", q: "Removing the attacker's backdoor, resetting compromised credentials, and patching the entry vulnerability happens in:", opts: ["Preparation", "Eradication", "Identification", "Reconnaissance"], ans: 1, exp: "Eradication removes root cause and adversary persistence." },
          { topic: "Lessons Learned", q: "Why is the Lessons Learned phase held after every major incident?", opts: ["To blame an employee", "To improve playbooks, detections, and prevent the same breach from recurring", "To delete old logs", "To close the firewall"], ans: 1, exp: "Post-mortems feed improvements directly back into Preparation." }
        ]
      }
    ]
  }
];
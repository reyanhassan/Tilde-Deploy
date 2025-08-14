resource "hcloud_firewall" "app-firewall" {
  name = "app-firewall"
  rule {
    direction = "in"
    protocol  = "icmp"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "80"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "443"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

}

resource "hcloud_server" "app-server" {
  name         = var.node-name
  server_type  = var.size
  image        = var.distro
  location     = var.location
  user_data    = ""
  firewall_ids = [hcloud_firewall.app-firewall.id]
  depends_on = [
    hcloud_firewall.myfirewall
  ]
}
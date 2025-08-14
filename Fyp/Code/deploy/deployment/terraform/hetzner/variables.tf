variable "hcloud_token" {
  type    = string
  default = "__HCLOUD_TOKEN__"
  sensitive = true
}

variable "node-name" {
  type = string
  default = "__NODE_NAME__"
}

variable "size" {
  type = string
  default = "__SIZE__"
}

variable "distro" {
  type = string
  default = "__DISTRO__"
}

variable "location" {
  type = string
  default = "__LOCATION__"
}


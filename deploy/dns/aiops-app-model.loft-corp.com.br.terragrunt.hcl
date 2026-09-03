#AUTOAPPLYME
include "root" {
  path   = find_in_parent_folders("root.hcl")
  expose = true
}

locals {
  component_name    = "route53/kong-record"
  component_version = "4.2.1"
}

terraform {
  source = "tfr://${include.root.locals.registry_host}/${local.component_name}/${include.root.locals.registry_provider}?version=${local.component_version}"
}

dependency "zone" {
  config_path = "../../../../../_global/infrastructure/route53/zones/loft-corp.com.br"
}

inputs = {
  zone_name          = dependency.zone.outputs.zone_name
  record_name        = "aiops-app-model"
  kong_accessibility = "corp"
  aws_account        = "infrastructure"
  environment        = "production"
}

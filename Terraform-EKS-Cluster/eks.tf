module "eks" {
    #import the module template
    source  = "terraform-aws-modules/eks/aws"
    version = "~> 21.0"
    
    # cluter info
    name               = local.name
    kubernetes_version = "1.33"

    endpoint_public_access = true 
    
    vpc_id     = module.vpc.vpc_id
    subnet_ids = module.vpc.private_subnets

    #control plane in intra subnet
    control_plane_subnet_ids = module.vpc.intra_subnets

    # EKS Addons - with most recent versions
    addons = {
      vpc-cni = {
        most_recent = true
      }
      coredns = {
        most_recent = true
      }
      kube-proxy = {
        most_recent = true
      }
     
    }

    # EKS Managed Node Group(s)
    eks_managed_node_groups = {
      my-cluster-ng = {
        ami_type       = "AL2023_x86_64_STANDARD"
        instance_types = ["t2.medium"]

        min_size     = 2
        max_size     = 3
        desired_size = 2

        capacity_type = "SPOT"
      }
    }

    tags = {
      Environment = local.env
      Terraform   = "true"
    }
}
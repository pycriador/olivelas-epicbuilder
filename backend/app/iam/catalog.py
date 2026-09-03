"""Canonical permission catalog and default roles/groups."""

from __future__ import annotations

PERMISSIONS: list[tuple[str, str, str, str]] = [
    # code, name, category, description
    ("portal.view", "Visualizar portal", "Portal", "Acessar conteúdo do portal"),
    ("cases.view", "Visualizar projetos", "Projetos", "Listar e abrir cases"),
    ("cases.create", "Criar projetos", "Projetos", "Criar novos cases"),
    ("cases.edit", "Editar projetos", "Projetos", "Editar cases existentes"),
    ("cases.delete", "Excluir projetos", "Projetos", "Excluir cases do portal"),
    ("cases.publish", "Publicar projetos", "Projetos", "Publicar e sincronizar cases"),
    ("areas.manage", "Gerenciar áreas", "Áreas", "CRUD de áreas do AI Map"),
    ("integrations.view", "Ver integrações", "Integrações", "Ver catálogo e diagnósticos"),
    ("integrations.manage", "Gerenciar integrações", "Integrações", "Alterar integrações"),
    ("iam.admin", "Administração IAM", "IAM", "Acesso total ao módulo IAM"),
    ("iam.users.view", "Ver usuários", "IAM", "Listar usuários"),
    ("iam.users.manage", "Gerenciar usuários", "IAM", "CRUD de usuários"),
    ("iam.groups.manage", "Gerenciar grupos", "IAM", "CRUD de grupos"),
    ("iam.roles.manage", "Gerenciar roles", "IAM", "CRUD de roles"),
    ("iam.permissions.manage", "Gerenciar permissões", "IAM", "CRUD e matriz de permissões"),
    ("iam.sessions.manage", "Gerenciar sessões", "IAM", "Encerrar sessões"),
    ("iam.audit.view", "Ver auditoria", "IAM", "Consultar logs de auditoria"),
    ("iam.invitations.manage", "Gerenciar convites", "IAM", "Criar e cancelar convites"),
    ("iam.shares.manage", "Gerenciar compartilhamentos", "IAM", "Criar e revogar shares"),
    ("settings.manage", "Gerenciar configurações", "Configurações", "Editar secrets e settings cifrados no banco"),
    ("share.read", "Leitura compartilhada", "Compartilhamento", "Permissão de leitura"),
    ("share.comment", "Comentário compartilhado", "Compartilhamento", "Permissão de comentário"),
    ("share.edit", "Edição compartilhada", "Compartilhamento", "Permissão de edição"),
    ("share.admin", "Admin compartilhado", "Compartilhamento", "Administração do recurso"),
]

ADMIN_GROUP = "Administrador"
EDITORS_GROUP = "Editores"
ADMIN_ROLE = "Administrador"
EDITORS_ROLE = "Editores"

# Editors get all portal content permissions, not IAM admin critical ones.
EDITOR_PERMISSION_CODES = {
    "portal.view",
    "cases.view",
    "cases.create",
    "cases.edit",
    "cases.delete",
    "cases.publish",
    "areas.manage",
    "integrations.view",
    "integrations.manage",
    "share.read",
    "share.comment",
    "share.edit",
}

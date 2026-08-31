from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "common_role"
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserRole(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        db_table = "common_user_roles"
        unique_together = (("user", "role"),)


class UserGroups(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    class Meta:
        db_table = "common_user_groups"
        unique_together = (("user", "group"),)


class UserUserPermissions(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        db_table = "common_user_user_permissions"
        unique_together = (("user", "permission"),)


class User(AbstractUser):
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    roles = models.ManyToManyField(
        Role,
        blank=True,
        related_name="users",
        through=UserRole,
    )
    groups = models.ManyToManyField(
        Group,
        verbose_name="groups",
        blank=True,
        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
        related_name="user_set",
        related_query_name="user",
        through=UserGroups,
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name="user permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        related_name="user_set",
        related_query_name="user",
        through=UserUserPermissions,
    )

    class Meta:
        db_table = "common_user"
        verbose_name = "user"
        verbose_name_plural = "users"


@receiver(post_save, sender=User)
def assign_default_role(sender, instance, created, **kwargs):
    if created:
        cliente_role = Role.objects.filter(slug="cliente").first()
        if cliente_role:
            instance.roles.add(cliente_role)


@receiver(m2m_changed, sender=UserRole)
def sync_staff_with_admin_role(sender, instance, action, **kwargs):
    if action in ("post_add", "post_remove", "post_clear"):
        has_admin = instance.roles.filter(slug="admin").exists()
        if has_admin and not instance.is_staff:
            User.objects.filter(pk=instance.pk).update(is_staff=True)
        elif not has_admin and instance.is_staff and not instance.is_superuser:
            User.objects.filter(pk=instance.pk).update(is_staff=False)

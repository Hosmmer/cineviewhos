from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class User(AbstractUser):
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    roles = models.ManyToManyField(Role, blank=True, related_name="users")


@receiver(post_save, sender=User)
def assign_default_role(sender, instance, created, **kwargs):
    if created:
        cliente_role = Role.objects.filter(slug="cliente").first()
        if cliente_role:
            instance.roles.add(cliente_role)


@receiver(m2m_changed, sender=User.roles.through)
def sync_staff_with_admin_role(sender, instance, action, **kwargs):
    if action in ("post_add", "post_remove", "post_clear"):
        has_admin = instance.roles.filter(slug="admin").exists()
        if has_admin and not instance.is_staff:
            User.objects.filter(pk=instance.pk).update(is_staff=True)
        elif not has_admin and instance.is_staff and not instance.is_superuser:
            User.objects.filter(pk=instance.pk).update(is_staff=False)

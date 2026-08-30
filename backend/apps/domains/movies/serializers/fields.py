from rest_framework import serializers


class RelativeImageField(serializers.ImageField):
    def to_representation(self, value):
        if not value:
            return None
        return value.url

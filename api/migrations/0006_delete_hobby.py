# Generated by Django 5.1.1 on 2024-12-18 14:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_hobby_users_alter_hobby_name'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Hobby',
        ),
    ]

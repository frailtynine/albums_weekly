# Generated by Django 5.0.7 on 2024-09-21 07:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='album',
            name='index',
            field=models.IntegerField(null=True, verbose_name='Index in Post'),
        ),
    ]

# Generated by Django 5.0.7 on 2025-01-21 13:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_alter_album_album_name_alter_album_band_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='album',
            name='text',
            field=models.TextField(verbose_name='Text'),
        ),
    ]

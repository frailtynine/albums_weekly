# Generated by Django 5.0.7 on 2025-01-08 16:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_album_pub_date_alter_podcast_pub_date_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='album',
            name='album_name',
            field=models.CharField(max_length=150, verbose_name='Album name'),
        ),
        migrations.AlterField(
            model_name='album',
            name='band_name',
            field=models.CharField(max_length=100, verbose_name='Band name'),
        ),
        migrations.CreateModel(
            name='PodcastViewCount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('count', models.IntegerField(default=0)),
                ('object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='view_count', to='api.podcast')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TextViewCount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('count', models.IntegerField(default=0)),
                ('object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='view_count', to='api.text')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
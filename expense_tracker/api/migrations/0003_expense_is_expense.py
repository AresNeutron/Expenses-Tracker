# Generated by Django 5.1.2 on 2024-12-21 02:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_remove_expense_is_expense"),
    ]

    operations = [
        migrations.AddField(
            model_name="expense",
            name="is_expense",
            field=models.BooleanField(default=True),
        ),
    ]
# Generated by Django 5.2.4 on 2025-07-30 12:21

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DefaultCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('is_expense', models.BooleanField(default=True)),
                ('icon', models.CharField(blank=True, default='', max_length=50)),
                ('color', models.CharField(default='#6B7280', max_length=7)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=100)),
                ('acc_type', models.CharField(choices=[('bank', 'Bank'), ('cash', 'Cash'), ('card', 'Credit Card'), ('other', 'Other')], db_index=True, default='bank', max_length=10)),
                ('balance', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('initial_balance', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('currency', models.CharField(db_index=True, default='USD', max_length=3)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('last_transaction_date', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accounts', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=100)),
                ('is_expense', models.BooleanField(db_index=True, default=True)),
                ('icon', models.CharField(blank=True, default='', max_length=50)),
                ('color', models.CharField(default='#6B7280', max_length=7)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('parent_category', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='subcategories', to='api.category')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='categories', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_type', models.CharField(choices=[('expense', 'Expense'), ('income', 'Income'), ('transfer', 'Transfer'), ('adjust', 'Adjustment')], db_index=True, default='expense', max_length=10)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('cleared', 'Cleared'), ('reconciled', 'Reconciled'), ('void', 'Void')], db_index=True, default='cleared', max_length=10)),
                ('category_id', models.PositiveIntegerField()),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='api.account')),
                ('category_type_model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.contenttype')),
                ('linked_transaction', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.transaction')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-id'],
            },
        ),
        migrations.AddIndex(
            model_name='account',
            index=models.Index(fields=['user', 'is_active'], name='api_account_user_id_5f43c8_idx'),
        ),
        migrations.AddIndex(
            model_name='account',
            index=models.Index(fields=['user', 'acc_type', 'is_active'], name='api_account_user_id_f76a8b_idx'),
        ),
        migrations.AddIndex(
            model_name='account',
            index=models.Index(fields=['currency', 'is_active'], name='api_account_currenc_42f568_idx'),
        ),
        migrations.AddIndex(
            model_name='account',
            index=models.Index(fields=['user', '-created_at'], name='api_account_user_id_e1e3a9_idx'),
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['user', 'is_expense', 'is_active'], name='api_categor_user_id_51b7b2_idx'),
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['user', 'parent_category'], name='api_categor_user_id_3f3ce0_idx'),
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['user', 'order', 'name'], name='api_categor_user_id_db606f_idx'),
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['is_expense', 'is_active'], name='api_categor_is_expe_205e83_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='category',
            unique_together={('user', 'name')},
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['user'], name='api_transac_user_id_87976a_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['user', 'account'], name='api_transac_user_id_a6db97_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['user', 'transaction_type'], name='api_transac_user_id_cb64ce_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['status', 'transaction_type'], name='api_transac_status_174464_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['user', 'status'], name='api_transac_user_id_daa5cc_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['account', 'status'], name='api_transac_account_ca6237_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['user', '-created_at'], name='api_transac_user_id_893f16_idx'),
        ),
    ]

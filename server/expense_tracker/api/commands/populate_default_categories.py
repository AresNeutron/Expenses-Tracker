from django.core.management.base import BaseCommand
from django.db import transaction
from default_categories import DefaultCategory 

class Command(BaseCommand):
    help = 'Populates the database with default categories from DefaultCategory model.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting population of default categories...'))

        try:
            with transaction.atomic():
                DefaultCategory.populate_defaults()
            self.stdout.write(self.style.SUCCESS('Successfully populated default categories.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An error occurred: {e}'))
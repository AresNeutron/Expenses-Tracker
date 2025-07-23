from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .default_categories import DefaultCategory # Asegúrate de la ruta de importación correcta

@receiver(post_migrate)
def populate_default_categories(sender, **kwargs):
    """
    Populate default categories after migrations are applied.
    This signal handler will only run if the 'api' app (or the app
    containing DefaultCategory) is being migrated.
    """
    # Evita ejecutar esto durante los tests o en entornos específicos si no es necesario
    if not kwargs.get('interactive', True): # Si no es un shell interactivo, etc.
        return

    # Opcional: solo poblar si es una migración del app que contiene DefaultCategory
    if kwargs.get('app_config').label == 'api':
        # Verificar si ya hay categorías por defecto para evitar repoblar innecesariamente
        if not DefaultCategory.objects.exists():
            print("Populating default categories...")
            DefaultCategory.populate_defaults()
            print("Default categories populated successfully.")
        else:
            print("Default categories already exist. Skipping population.")
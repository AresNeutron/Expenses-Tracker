from rest_framework.renderers import JSONRenderer

class CustomResponseRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        status_code = renderer_context['response'].status_code

        # Determina si la respuesta es exitosa (códigos 2xx)
        is_success = str(status_code).startswith('2')

        # Formato de la respuesta
        response_data = {
            'success': is_success
        }

        if is_success:
            response_data['data'] = data
        else:
            # Para errores, `data` contendrá los detalles del error de DRF
            response_data['error_details'] = data

        # Llama al renderizador JSON base para convertir el diccionario a JSON
        return super().render(response_data, accepted_media_type, renderer_context)
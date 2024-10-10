# server/comentarios_emol/pipelines.py

import datetime

class FechaConversionPipeline:
    def process_item(self, item, spider):
        timestamp_ms = item.get('fecha')  # 'fecha' contiene el timestamp en ms
        if timestamp_ms is not None:
            try:
                # Convertir milisegundos a segundos
                timestamp_sec = float(timestamp_ms) / 1000.0

                # Crear objeto datetime en UTC
                dt = datetime.datetime.utcfromtimestamp(timestamp_sec)

                # Formatear a ISO 8601 con milisegundos y 'Z' al final
                formatted_date = dt.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'

                # Actualizar el campo 'fecha'
                item['fecha'] = formatted_date
            except (ValueError, OSError) as e:
                spider.logger.error(f"Error al convertir fecha: {e} para el timestamp: {timestamp_ms}")
                item['fecha'] = None  # Establecer como None si ocurre un error
        else:
            item['fecha'] = None  # Manejar caso donde 'fecha' no está presente
        return item

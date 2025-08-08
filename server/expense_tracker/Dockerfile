FROM python:3.12-slim

# 2. Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# 3. Copia el archivo de dependencias a la imagen.
COPY ./requirements.txt .

# 4. Instala las dependencias de Python.
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copia todo el código de tu proyecto al contenedor.
COPY . .

# 6. Expón el puerto en el que se ejecutará tu servidor.
EXPOSE 8000

# 7. El comando que se ejecuta cuando el contenedor inicia.
# Este es el comando para iniciar el servidor de desarrollo de Django.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
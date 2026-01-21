# Análisis Estadístico de Retornos Financieros: Una Aplicación Web Interactiva

## 1. Introducción

El análisis cuantitativo de mercados financieros depende en gran medida de la capacidad para inferir propiedades poblacionales a partir de muestras históricas. Una de las preguntas fundamentales para cualquier analista o inversor es si un activo financiero posee una tendencia (drift) estadísticamente significativa diferente de cero, o si sus movimientos observados pueden atribuirse meramente al azar (ruido).

El presente proyecto, **"Laboratory"**, es una aplicación web diseñada para democratizar y facilitar este análisis. Permite a usuarios, estudiantes y profesionales realizar pruebas de hipótesis sobre los retornos de activos financieros reales en tiempo real, proporcionando no solo los resultados numéricos rigurosos, sino también una interpretación visual y pedagógica de los mismos.

El objetivo principal es cerrar la brecha entre la teoría estadística abstracta y la práctica financiera, ofreciendo una herramienta que calcula, visualiza y explica la significancia estadística de los rendimientos históricos.

## 2. Marco Teórico

El núcleo analítico de la aplicación se basa en la **Inferencia Estadística Paramétrica**.

### 2.1. Retornos Logarítmicos
Para el análisis de series de tiempo financieras, se utilizan los retornos logarítmicos (o continuos) en lugar de los retornos simples, debido a sus propiedades aditivas y su mayor proximidad a la distribución normal.

Si $P_t$ es el precio de cierre ajustado en el tiempo $t$, el retorno logarítmico $r_t$ se define como:
$$ r_t = \ln\left(\frac{P_t}{P_{t-1}}\right) $$

### 2.2. Prueba t de Student para una Muestra
Se asume que los retornos logarítmicos siguen una distribución aproximadamente normal con media $\mu$ y varianza $\sigma^2$ desconocida (o que el tamaño de la muestra es suficientemente grande para invocar el Teorema Central del Límite).

Las hipótesis planteadas son:
*   **Hipótesis Nula ($H_0$):** $\mu = 0$ (El activo no tiene tendencia real; es una caminata aleatoria sin deriva).
*   **Hipótesis Alternativa ($H_1$):** $\mu \neq 0$ (El activo tiene una tendencia significativa, positiva o negativa).

El estadístico de prueba $t$ se calcula como:
$$ t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}} $$
Donde $\bar{x}$ es la media muestral, $s$ es la desviación estándar muestral, $n$ es el número de observaciones, y $\mu_0 = 0$.

### 2.3. Criterio de Decisión
La decisión de rechazar $H_0$ se basa en el **valor-p (p-value)**. Si el valor-p es menor que el nivel de significancia $\alpha$ (donde $\alpha = 1 - \text{Nivel de Confianza}$), se rechaza la hipótesis nula, concluyendo que existe evidencia estadística de una tendencia.

## 3. Metodología

El desarrollo sigue una arquitectura moderna de **Single Page Application (SPA)** desacoplada.

### 3.1. Arquitectura Tecnológica
*   **Backend (Servidor de Datos):** Desarrollado en **Python** utilizando el framework **FastAPI**.
    *   *Funcionalidad:* Actúa como interfaz con la API de Yahoo Finance (`yfinance`). Se encarga de la extracción de datos históricos, limpieza (manejo de valores nulos) y transformación (cálculo de retornos logarítmicos con `numpy`).
*   **Frontend (Interfaz de Usuario):** Construido con **React.js** y **Vite**.
    *   *Funcionalidad:* Gestiona la interacción del usuario, visualización de datos y, crucialmente, realiza los cálculos estadísticos finales (t-test, distribuciones de probabilidad) en el lado del cliente utilizando la librería `jStat`.

### 3.2. Flujo de Datos
1.  El usuario solicita un activo (ej. "AAPL") y parámetros (Periodo, Nivel de Confianza).
2.  El Frontend solicita al Backend los retornos históricos.
3.  El Backend descarga los precios, calcula los retornos $r_t$ y los devuelve en formato JSON.
4.  El Frontend recibe los datos brutos y ejecuta el análisis estadístico:
    *   Cálculo de estadísticos descriptivos ($\bar{x}, s$).
    *   Cálculo del intervalo de confianza y valor-p.
    *   Generación del histograma de frecuencias y la curva de densidad normal teórica.

## 4. Ejecución y Análisis de Resultados

### 4.1. Interfaz de Laboratorio
La aplicación presenta un "Laboratorio" donde el usuario puede alternar entre:
*   **Modo Simulación:** Genera datos aleatorios (Movimiento Browniano Geométrico) para entender cómo se ve el azar puro.
*   **Datos Reales:** Analiza activos del mercado real.

### 4.2. Visualización
Se implementó un gráfico compuesto utilizando `recharts` que superpone:
*   **Histograma de Frecuencias:** Muestra la distribución empírica de los retornos diarios.
*   **Curva Normal Ajustada:** Muestra la distribución teórica bajo los parámetros muestrales.
*   **Líneas de Referencia:** Marcan la media muestral ($\bar{x}$) y la media nula ($H_0: \mu=0$), permitiendo visualizar visualmente la distancia estandarizada.

### 4.3. Interpretación Automatizada
Una innovación clave del proyecto es la "Capa de Interpretación". El sistema no solo arroja números, sino que traduce el valor-p a lenguaje natural, clasificando la evidencia como:
*   **Sin Evidencia:** Los retornos son indistinguibles del ruido (p > 0.10).
*   **Evidencia Débil/Moderada:** Indicios de tendencia (0.01 < p < 0.10).
*   **Evidencia Fuerte:** Alta certeza estadística de tendencia (p < 0.01).

## 5. Conclusión

El proyecto demuestra cómo la integración de tecnologías web modernas con librerías estadísticas robustas permite crear herramientas educativas y analíticas potentes. La aplicación logra simplificar conceptos complejos como la prueba de hipótesis, haciendo visible lo invisible: la distinción entre la suerte (volatilidad aleatoria) y la realidad (tendencia subyacente) en los mercados financieros.

Para trabajos futuros, se sugiere la implementación de pruebas de normalidad (Jarque-Bera) para validar los supuestos del modelo y la inclusión de métricas de riesgo como el Value at Risk (VaR).

## 6. Referencias

1.  **Hull, J. C.** (2018). *Options, Futures, and Other Derivatives*. Pearson.
2.  **McKinney, W.** (2017). *Python for Data Analysis*. O'Reilly Media. (Referencia para Pandas/Numpy).
3.  **FastAPI Documentation**. https://fastapi.tiangolo.com/
4.  **React Documentation**. https://react.dev/
5.  **Yahoo Finance API**. https://pypi.org/project/yfinance/

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, Cookie, Eye, Mail } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Política de Privacidad & Cookies</h1>
          <p className="text-xl text-muted-foreground">
            Tu privacidad es importante para nosotros. Aquí te explicamos cómo manejamos tus datos.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Política de Privacidad
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-muted-foreground mb-4">
                <strong>Última actualización:</strong> 1 de enero de 2025
              </p>

              <h3 className="text-lg font-semibold mb-3">1. Información que recopilamos</h3>
              <p className="text-muted-foreground mb-4">
                En CodeGym, recopilamos la siguiente información para brindarte el mejor servicio:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
                <li><strong>Información de cuenta:</strong> Correo electrónico, nombre de usuario, nombre completo</li>
                <li><strong>Información de programación:</strong> Código fuente de tus soluciones, tiempos de ejecución, historial de ejercicios</li>
                <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, sistema operativo</li>
                <li><strong>Datos de uso:</strong> Páginas visitadas, tiempo de sesión, interacciones con la plataforma</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">2. Cómo utilizamos tu información</h3>
              <p className="text-muted-foreground mb-4">
                Utilizamos tu información para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
                <li>Proporcionar y mantener nuestros servicios</li>
                <li>Personalizar tu experiencia de aprendizaje</li>
                <li>Generar rankings y estadísticas</li>
                <li>Comunicarnos contigo sobre actualizaciones y cambios</li>
                <li>Mejorar la seguridad y prevenir fraudes</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">3. Compartir información</h3>
              <p className="text-muted-foreground mb-6">
                No vendemos ni alquilamos tu información personal a terceros. Solo compartimos datos en casos específicos:
                para cumplir con obligaciones legales, proteger nuestros derechos o con tu consentimiento explícito.
              </p>

              <h3 className="text-lg font-semibold mb-3">4. Tus derechos</h3>
              <p className="text-muted-foreground mb-4">
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
                <li>Acceder a tu información personal</li>
                <li>Corregir datos incorrectos</li>
                <li>Solicitar la eliminación de tu cuenta</li>
                <li>Exportar tus datos</li>
                <li>Retirar el consentimiento en cualquier momento</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Política de Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-3">¿Qué son las cookies?</h3>
              <p className="text-muted-foreground mb-6">
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo para mejorar tu experiencia 
                en nuestro sitio web.
              </p>

              <h3 className="text-lg font-semibold mb-3">Tipos de cookies que utilizamos</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-medium mb-2">Cookies esenciales</h4>
                  <p className="text-muted-foreground text-sm">
                    Necesarias para el funcionamiento básico del sitio, como mantener tu sesión iniciada.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Cookies de rendimiento</h4>
                  <p className="text-muted-foreground text-sm">
                    Nos ayudan a entender cómo interactúas con el sitio para mejorarlo.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Cookies de preferencias</h4>
                  <p className="text-muted-foreground text-sm">
                    Recuerdan tus configuraciones y preferencias personales.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">Control de cookies</h3>
              <p className="text-muted-foreground mb-6">
                Puedes controlar y eliminar cookies a través de la configuración de tu navegador. Sin embargo, 
                esto puede afectar la funcionalidad de nuestro sitio.
              </p>
            </CardContent>
          </Card>

          {/* GDPR Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Cumplimiento GDPR
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-muted-foreground mb-4">
                CodeGym cumple con el Reglamento General de Protección de Datos (GDPR) de la Unión Europea 
                y la legislación chilena de protección de datos.
              </p>

              <h3 className="text-lg font-semibold mb-3">Base legal para el procesamiento</h3>
              <p className="text-muted-foreground mb-6">
                Procesamos tus datos basándose en tu consentimiento, la ejecución de un contrato, 
                nuestros intereses legítimos y el cumplimiento de obligaciones legales.
              </p>

              <h3 className="text-lg font-semibold mb-3">Transferencias internacionales</h3>
              <p className="text-muted-foreground mb-6">
                Tus datos pueden ser transferidos y procesados en países fuera de la UE que cuentan 
                con medidas de seguridad adecuadas.
              </p>

              <h3 className="text-lg font-semibold mb-3">Retención de datos</h3>
              <p className="text-muted-foreground mb-6">
                Mantenemos tu información personal solo durante el tiempo necesario para cumplir 
                con los propósitos establecidos en esta política.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Si tienes preguntas sobre esta política de privacidad o deseas ejercer tus derechos, 
                no dudes en contactarnos:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <div><strong>Email:</strong> privacy@codegym.com</div>
                <div><strong>Dirección:</strong> Santiago, Chile</div>
                <div><strong>Responsable de datos:</strong> Equipo CodeGym</div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Footer note */}
          <div className="text-center text-muted-foreground">
            <p className="mb-4">
              Esta política puede ser actualizada periódicamente. Te notificaremos sobre cambios importantes.
            </p>
            <p className="text-sm">
              © 2025 CodeGym. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

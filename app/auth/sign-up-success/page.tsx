import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Registro Exitoso!</CardTitle>
            <CardDescription>Hemos enviado un correo de confirmación a tu email</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta.
            </p>
            <Link
              href="/auth/login"
              className="inline-block text-sm font-medium text-green-600 hover:text-green-500 underline underline-offset-4"
            >
              Ir a iniciar sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

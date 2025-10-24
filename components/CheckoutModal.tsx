"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatearFechaLocal, formatearPrecio } from "@/utils/formatters";
import {
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Lock,
  MapPin,
  Smartphone,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useReserva } from "@/hooks/useReserva";
import { useReservas } from "@/hooks/useReservas";
import type { Reserva } from "@/types";
import { useRouter } from "next/navigation";

// Definición de tipos para Culqi
declare global {
  interface Window {
    CulqiCheckout: new (
      publicKey: string,
      config: CulqiConfig
    ) => CulqiInstance;
  }
}

interface CulqiInstance {
  token?: { id: string };
  order?: unknown;
  error?: { user_message: string };
  culqi: () => void;
  open: () => void;
  close: () => void;
}

interface CulqiConfig {
  settings: {
    title: string;
    currency: string;
    amount: number;
    order: string;
    xculqirsaid: string;
    rsapublickey: string;
  };
  client: {
    email: string;
  };
  options: {
    lang: string;
    installments: boolean;
    modal: boolean;
    container?: string;
    paymentMethods: {
      tarjeta?: boolean;
      yape?: boolean;
      billetera?: boolean;
      bancaMovil?: boolean;
      agente?: boolean;
      cuotealo?: boolean;
    };
    paymentMethodsSort: string[];
  };
}

// Constantes de Culqi desde variables de entorno
const CULQI_CONFIG = {
  PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY!,
  ORDER_ID: process.env.NEXT_PUBLIC_CULQI_ORDER_ID!,
  RSA_ID: process.env.NEXT_PUBLIC_CULQI_RSA_ID!,
  RSA_PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_RSA_PUBLIC_KEY!,
  TITLE: process.env.NEXT_PUBLIC_CULQI_TITLE!,
  PAYMENT_METHODS: { yape: true },
};

export function CheckoutModal() {
  const { state, dispatch } = useAppContext();
  const { user } = useAuth();
  const { cerrarCheckout } = useReserva();
  const { crearReserva } = useReservas();
  const router = useRouter();
  const [metodoPago, setMetodoPago] = useState("yape");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const culqiInstanceRef = useRef<CulqiInstance | null>(null);
  const scriptsLoadedRef = useRef(false);

  const { checkout } = state;
  const reservaData = checkout.reservaData;

  // Función para crear la reserva después del pago exitoso
  const crearReservaFinal = async () => {
    if (!user || !reservaData) return;

    try {
      // Generar código de verificación único (6 dígitos)
      const codigoVerificacion = Math.random()
        .toString()
        .slice(2, 8)
        .padStart(6, "0");

      const reservaData_API = {
        userId: user.id,
        usuarioNombre: user.nombre,
        usuarioEmail: user.email,
        usuarioTelefono: user.telefono || "No proporcionado",
        canchaId: 0, // Campo deprecated, ya no se usa
        zonaId: reservaData.zona!.id,
        fecha: formatearFechaLocal(reservaData.fecha),
        horarios: reservaData.horarios,
        precio: reservaData.total,
        estado: "confirmada" as const, // Confirmada porque el pago fue exitoso
        metodoPago,
        establecimiento: reservaData.cancha!.establecimiento,
        cancha: reservaData.cancha!.nombre,
        zona: reservaData.zona!.nombre,
        direccion: reservaData.cancha!.direccion,
        telefono: reservaData.cancha!.telefono,
        codigoVerificacion,
      };

      // Guardar en Supabase
      const reservaCreada = await crearReserva(reservaData_API);

      // Crear objeto completo para el dispatch (con id y fechaCreacion)
      const nuevaReserva: Reserva = {
        id: reservaCreada.id,
        ...reservaData_API,
        fechaCreacion: reservaCreada.fecha_creacion || new Date().toISOString(),
      };

      dispatch({ type: "CONFIRMAR_RESERVA", payload: nuevaReserva });

      router.push(`/confirmacion/${nuevaReserva.id}`);
    } catch (error) {
      console.error("Error al crear reserva:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al crear la reserva";
      setError(
        `Hubo un error al crear la reserva:\n\n${errorMessage}\n\nPor favor intenta nuevamente.`
      );
      throw error;
    }
  };

  // Función para crear la configuración de Culqi
  const createCulqiConfig = useCallback((): CulqiConfig => {
    // Convertir el total a céntimos (Culqi usa céntimos)
    const amountInCentimos = Math.round((reservaData?.total || 0) * 100);

    return {
      settings: {
        title: CULQI_CONFIG.TITLE,
        currency: "PEN",
        amount: amountInCentimos,
        order: CULQI_CONFIG.ORDER_ID,
        xculqirsaid: CULQI_CONFIG.RSA_ID,
        rsapublickey: CULQI_CONFIG.RSA_PUBLIC_KEY,
      },
      client: {
        email: user?.email || "cliente@entrysport.com",
      },
      options: {
        lang: "auto",
        installments: false,
        modal: false, // Desactivar modal, usar contenedor
        container: "#culqi-checkout-container", // ID del contenedor
        paymentMethods: CULQI_CONFIG.PAYMENT_METHODS,
        paymentMethodsSort: Object.keys(CULQI_CONFIG.PAYMENT_METHODS),
      },
    };
  }, [reservaData?.total, user?.email]);

  // Handler para procesar el token de Culqi
  const handleToken = useCallback(
    async (tokenId: string) => {
      if (!reservaData) return;

      try {
        culqiInstanceRef.current?.close();

        // Mostrar mensaje de verificación
        setError("");
        setVerifyingPayment(true);
        setIsProcessing(true);

        const amountInCentimos = Math.round(reservaData.total * 100);

        const response = await fetch("/api/culqi/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: tokenId,
            amount: amountInCentimos,
            currency_code: "PEN",
            email: user?.email || "cliente@entrysport.com",
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Pago exitoso, crear la reserva
          await crearReservaFinal();
        } else {
          setError(data.message || "Error al procesar el pago");
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("Error en handleToken:", err);
        setError("Error de conexión. Intenta nuevamente.");
        setIsProcessing(false);
      } finally {
        setVerifyingPayment(false);
      }
    },
    [reservaData, user?.email, crearReservaFinal]
  );

  // Función para inicializar Culqi
  const initializeCulqi = useCallback(() => {
    if (!window.CulqiCheckout) return;

    const config = createCulqiConfig();
    const instance = new window.CulqiCheckout(CULQI_CONFIG.PUBLIC_KEY, config);

    instance.culqi = function () {
      if (instance.token) {
        console.log("Token creado:", instance.token.id);
        handleToken(instance.token.id);
      } else if (instance.order) {
        console.log("Order creada:", instance.order);
      } else {
        console.log("Error:", instance.error);
        setError(instance.error?.user_message || "Error al procesar el pago");
        setIsProcessing(false);
      }
    };

    culqiInstanceRef.current = instance;
  }, [createCulqiConfig, handleToken]);

  // Cargar scripts de Culqi
  useEffect(() => {
    if (scriptsLoadedRef.current) return;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Verificar si el script ya existe
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadScripts = async () => {
      try {
        await loadScript("https://3ds.culqi.com");
        await loadScript("https://js.culqi.com/checkout-js");
        scriptsLoadedRef.current = true;
        initializeCulqi();
      } catch (err) {
        console.error("Error cargando scripts de Culqi:", err);
        setError("Error al cargar el sistema de pagos. Recarga la página.");
      }
    };

    loadScripts();
  }, [initializeCulqi]);

  // Actualizar instancia cuando cambia el total o el email
  useEffect(() => {
    if (
      scriptsLoadedRef.current &&
      window.CulqiCheckout &&
      metodoPago === "yape"
    ) {
      initializeCulqi();
    }
  }, [reservaData?.total, user?.email, initializeCulqi, metodoPago]);

  const handleConfirmarReserva = async () => {
    if (!user || !reservaData) return;

    // Si el método de pago es Yape, mostrar el checkout inline
    if (metodoPago === "yape") {
      if (!culqiInstanceRef.current) {
        setError("Culqi no está inicializado. Por favor, recarga la página.");
        return;
      }

      setIsProcessing(true);
      setError("");
      // En modo container, solo necesitamos abrir el checkout
      culqiInstanceRef.current.open();
      return;
    }

    // Si el método de pago es efectivo, flujo original
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generar código de verificación único (6 dígitos)
      const codigoVerificacion = Math.random()
        .toString()
        .slice(2, 8)
        .padStart(6, "0");

      const reservaData_API = {
        userId: user.id,
        usuarioNombre: user.nombre,
        usuarioEmail: user.email,
        usuarioTelefono: user.telefono || "No proporcionado",
        canchaId: 0, // Campo deprecated, ya no se usa
        zonaId: reservaData.zona!.id,
        fecha: formatearFechaLocal(reservaData.fecha),
        horarios: reservaData.horarios,
        precio: reservaData.total,
        estado: "pendiente" as const,
        metodoPago,
        establecimiento: reservaData.cancha!.establecimiento,
        cancha: reservaData.cancha!.nombre,
        zona: reservaData.zona!.nombre,
        direccion: reservaData.cancha!.direccion,
        telefono: reservaData.cancha!.telefono,
        codigoVerificacion,
      };

      // Guardar en Supabase
      const reservaCreada = await crearReserva(reservaData_API);

      // Crear objeto completo para el dispatch (con id y fechaCreacion)
      const nuevaReserva: Reserva = {
        id: reservaCreada.id,
        ...reservaData_API,
        fechaCreacion: reservaCreada.fecha_creacion || new Date().toISOString(),
      };

      dispatch({ type: "CONFIRMAR_RESERVA", payload: nuevaReserva });

      router.push(`/confirmacion/${nuevaReserva.id}`);
    } catch (error) {
      console.error("Error al crear reserva:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al crear la reserva";
      alert(
        `Hubo un error al crear la reserva:\n\n${errorMessage}\n\nPor favor intenta nuevamente.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Validación: si no hay datos de reserva, no renderizar nada
  if (!reservaData || !reservaData.cancha || !reservaData.zona) return null;

  return (
    <Dialog open={checkout.isOpen} onOpenChange={cerrarCheckout}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmar Reserva</DialogTitle>
          <DialogDescription>
            Revisa los detalles y completa tu reserva
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {reservaData.cancha!.establecimiento}
                  </p>
                  <p className="text-sm text-gray-600">
                    {reservaData.cancha!.nombre} - {reservaData.zona!.nombre}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span>
                  {reservaData.fecha.toLocaleDateString("es-PE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <span>{reservaData.horarios.join(", ")}</span>
              </div>

              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">{reservaData.cancha!.direccion}</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center font-medium text-lg">
                <span>Total:</span>
                <span className="text-green-600">
                  {formatearPrecio(reservaData.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Método de Pago</CardTitle>
              <CardDescription>
                Selecciona cómo deseas pagar tu reserva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={metodoPago} onValueChange={setMetodoPago}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yape" id="yape" />
                  <Label
                    htmlFor="yape"
                    className="flex items-center cursor-pointer"
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    Yape / Plin / Tarjeta
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="efectivo" id="efectivo" />
                  <Label
                    htmlFor="efectivo"
                    className="flex items-center cursor-pointer"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Pago en el establecimiento
                  </Label>
                </div>
              </RadioGroup>

              {metodoPago === "yape" && !isProcessing && (
                <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-teal-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-teal-900 mb-1">
                        Pago seguro con Culqi
                      </p>
                      <p className="text-sm text-teal-700">
                        Haz clic en "Pagar con Culqi" para completar tu
                        transacción con tarjeta o Yape.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenedor para el checkout de Culqi */}
              {metodoPago === "yape" && isProcessing && !verifyingPayment && (
                <div className="mt-4">
                  <div
                    id="culqi-checkout-container"
                    className="min-h-[400px] rounded-lg border border-gray-200 bg-white"
                  />
                </div>
              )}

              {metodoPago === "efectivo" && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Podrás pagar directamente en el establecimiento al momento
                    de tu reserva. Recuerda llevar el comprobante de reserva.
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {verifyingPayment && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <p className="text-sm text-blue-800">
                    Verificando el pago, por favor espera...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (isProcessing && metodoPago === "yape") {
                  // Cerrar el checkout de Culqi si está abierto
                  culqiInstanceRef.current?.close();
                  setIsProcessing(false);
                  setError("");
                }
                cerrarCheckout();
              }}
              className="flex-1 bg-transparent"
              disabled={verifyingPayment}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarReserva}
              disabled={isProcessing || verifyingPayment}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing && metodoPago === "yape" ? (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Checkout de Culqi activo
                </span>
              ) : isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </span>
              ) : metodoPago === "yape" ? (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Pagar con Culqi
                </span>
              ) : (
                "Confirmar Reserva"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

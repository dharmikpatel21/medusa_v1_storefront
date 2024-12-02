"use client"
import formatISODate from "@/lib/util/format-iso-date"
import { cn } from "@/lib/utils"
import Image from "next/image"
import React, { useState } from "react"
import Mobile from "public/images/mobile.webp"
import Scan from "public/images/scan.webp"
import GreenTick from "public/images/greenTick.webp"
type Props = {
  order: any
  variant: "payment" | "pending" | "pendingDetail"
}
const paymentSteps = [
  {
    image: Mobile,
    title: "mobile image",
    text: "Abra o app do seu banco ou instituição financeira e entre no ambiente Pix.",
  },
  {
    image: Scan,
    title: "scan image",
    text: "Escolha a opção Pagar com QR Code e escanele o código ao lado.",
  },
  {
    image: GreenTick,
    title: "green tick image",
    text: "Confirme as informações e finalize o pagamento.",
  },
]

const PixQrCode = ({ order, variant }: Props) => {
  const [isCopied, setIsCopied] = useState(false)

  const qrSrc =
    (order?.payment_session?.data as any)?.qr_codes?.[0]?.links?.[0]?.href ?? ""
  const qrText =
    (order?.payment_session?.data as any)?.qr_codes?.[0]?.text ?? ""

  const expirationDate =
    (order?.payment_session?.data as any)?.qr_codes?.[0]?.expiration_date ?? ""

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // navigator.clipboard API is available
        await navigator.clipboard.writeText(qrText)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = qrText
        textArea.style.position = "fixed" // Avoid scrolling to bottom
        textArea.style.opacity = "0" // Hide the textarea
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 5000) // Reset after 5 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 bg-white font-sans-radnika *:text-primary/80",
        {
          ["text-center"]: variant === "pending",
          ["p-5 rounded-2xl"]: variant === "payment",
        }
      )}
    >
      {variant === "payment" && (
        <p className="text-2xl text-center">Foi uma ótima escolha!</p>
      )}
      {variant === "pendingDetail" && (
        <p>
          O pedido <span className="bg-yellow-300">#{order.display_id}</span>{" "}
          foi realizado em{" "}
          <span className="bg-yellow-300">
            #{new Date(order.created_at).toDateString()}
          </span>{" "}
          e atualmente está <span className="bg-yellow-300">Pix não pago.</span>
        </p>
      )}
      <p>
        Efetue o pagamento PIX usando
        <span className="font-bold">o código de barras</span> ou usando{" "}
        <span className="font-bold">PIX copia e cola</span>, se preferir:
      </p>
      <div
        className={cn("flex justify-center", {
          ["grid grid-cols-[30%_1fr] gap-6 max-md:grid-cols-2 max-sm:grid-cols-1"]:
            variant === "pendingDetail" || variant === "payment",
        })}
      >
        {/* <div className="grid grid-cols-[30%_1fr] gap-6 max-md:grid-cols-2 max-sm:grid-cols-1"> */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full max-w-[200px] aspect-square max-sm:self-center">
            <Image
              src={qrSrc}
              alt="pixQrCode"
              title="pixQrCode"
              fill
              className="object-cover"
            />
          </div>
          <p>
            Data de vencimento:{" "}
            <span className="font-bold">{formatISODate(expirationDate)}</span>
          </p>
        </div>

        {(variant === "pendingDetail" || variant === "payment") && (
          <div className="flex flex-col gap-8">
            {paymentSteps.map((step, index) => (
              <div
                key={index}
                className="flex justify-start items-center gap-4"
              >
                <div
                  className={cn(
                    "relative overflow-hidden w-12 aspect-square rounded-full border flex items-center justify-center",
                    step.title === "green tick image" ? "w-10 border-none" : ""
                  )}
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    title={step.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <p
                  className={cn("text-wrap", {
                    ["text-sm"]: variant === "payment",
                  })}
                >
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex self-center items-center gap-2">
          <p>Pagar com PIX copia e cola - </p>
          {isCopied && (
            <p className="bg-[#17a2b8] px-2 rounded-sm text-white uppercase text-sm">
              Copiado!
            </p>
          )}
          {!isCopied && (
            <button
              onClick={handleCopy}
              className="bg-[#17a2b8] px-2 rounded-sm text-white uppercase text-sm"
            >
              Clique para copiar
            </button>
          )}
        </div>
        <p
          onClick={handleCopy}
          className="cursor-pointer bg-primary/10 text-center break-all p-4 rounded-lg text-primary/80 font-semibold text-sm"
        >
          Seu código PIX: {qrText}
        </p>
      </div>
      <div className="flex flex-col gap-1 text-center *:text-sm">
        <p>
          Após o pagamento, podemos levar alguns segundos para confirmar o seu
          pagamento.
        </p>

        <p>Você será avisado(a) assim que isso ocorrer!</p>
      </div>
      {variant === "payment" && (
        <p className="text-2xl text-center">Você vai adorar seus produtos.</p>
      )}
    </div>
  )
}

export default PixQrCode

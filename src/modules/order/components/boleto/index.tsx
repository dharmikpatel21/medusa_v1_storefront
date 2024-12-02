"use client"
import { cn } from "@/lib/utils"
import { Cart } from "@medusajs/medusa"
import Link from "next/link"
import React, { useState } from "react"
import ThumbIcon from "public/icons/thumb.svg"
import formatISODate from "@/lib/util/format-iso-date"
import Barcode from "@/components/common/Barcode"
type Props = {
  barcode: string
  cart: Omit<Cart, "refundable_amount" | "refunded_total"> & {
    display_id: string
  }
  variant: "payment" | "pendingDetail"
}

const Boleto = ({ barcode, cart, variant }: Props) => {
  const pdfSrc = (cart?.payment_session?.data as any)?.charges?.[0]?.links?.[0]
    ?.href

  const expirationDate =
    (cart?.payment_session?.data as any)?.charges?.[0]?.payment_method?.boleto
      ?.due_date || ""
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // navigator.clipboard API is available
        await navigator.clipboard.writeText(barcode)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = barcode
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
    <div className="flex flex-col justify-center gap-8">
      {variant === "payment" && (
        <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl">
          <Link href={pdfSrc} download="boleto.pdf" target="_blank">
            Pagar o Boleto
          </Link>
          <div className="flex flex-col gap-4">
            <div className="flex self-center items-center gap-2">
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
                  CLIQUE PARA COPIAR O CÓDIGO
                </button>
              )}
            </div>
            <p
              onClick={handleCopy}
              className="cursor-pointer bg-primary/10 text-center break-all p-4 rounded-lg text-primary/80 font-semibold text-sm"
            >
              {barcode}
            </p>
          </div>
        </div>
      )}
      {variant === "pendingDetail" && (
        <p className="text-primary/80 text-sm">
          O pedido <span className="bg-yellow-300">#{cart?.display_id}</span>{" "}
          foi realizado em{" "}
          <span className="bg-yellow-300">
            #{new Date(cart?.created_at).toDateString()}
          </span>{" "}
          e atualmente está{" "}
          <span className="bg-yellow-300">Aguardando pagamento.</span>
        </p>
      )}
      <div className="flex flex-col gap-4 bg-white p-5 text-center rounded-2xl">
        {variant === "payment" && (
          <p className="text-2xl">Foi uma ótima escolha!</p>
        )}
        <div>
          <p className="text-sm">
            Pague seu boleto usando o código de barras ou a linha digitável, se
            preferir:
          </p>

          <Barcode value={barcode} />
        </div>
        {/* <p className="text-base">
          34191.09404 60181.230248 61514.190000 4 98480000034500
        </p> */}

        {variant === "payment" && (
          <p className="text-2xl">Você vai adorar seus produtos.</p>
        )}
      </div>

      {variant === "pendingDetail" && (
        <div className="flex flex-col gap-4">
          <Link href={pdfSrc || ""} download="boleto.pdf" target="_blank">
            Pagar o Boleto
          </Link>
          <div className="flex gap-2 items-start">
            <span className="w-4 aspect-square">
              <ThumbIcon />
            </span>

            <div className="flex flex-col *:text-sm text-primary/80">
              <p>
                <span className="font-bold">Atenção!</span> Você NÃO vai receber
                o boleto pelos Correios.
              </p>
              <p>
                Clique no link abaixo e pague o boleto pelo seu aplicativo de
                Internet Banking .
              </p>
              <p>
                Se preferir, você pode imprimir e pagar o boleto em qualquer
                agência bancária ou lotérica.
              </p>
              <p>
                <span className="font-bold text-sm">
                  Data de vencimento do Boleto:
                </span>{" "}
                {formatISODate(expirationDate)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Boleto

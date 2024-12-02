import React from "react"
import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import PayPal from "@modules/common/icons/paypal"
import Pix from "public/icons/pix.svg"
import Boleto from "public/icons/boleto.svg"
import CreditCard from "public/icons/credit-card.svg"
/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "stripe-ideal": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "stripe-bancontact": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  manual: {
    title: "Test payment",
    icon: <CreditCard />,
  },
  // Add more payment providers here
  pagbank: {
    title: "CREDIT CARD",
    icon: <CreditCard className="h-8 sm:h-12 aspect-square" />,
  },
  "pagbank-pix": {
    title: "PIX",
    icon: <Pix className="h-8 sm:h-16 aspect-square" />,
  },
  "pagbank-boleto": {
    title: "BOLETO",
    icon: <Boleto className="h-8 sm:h-14 aspect-square" />,
  },
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]

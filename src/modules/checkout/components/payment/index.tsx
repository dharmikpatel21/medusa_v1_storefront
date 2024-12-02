"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Cart } from "@medusajs/medusa"
import { paymentInfoMap } from "@/lib/constants"
import PaymentButton from "../payment-button"
import Spinner from "@/modules/common/icons/spinner"
import { Tab } from "@headlessui/react"
import { clx } from "@medusajs/ui"
export type SelectOptions = "1x" | "2x" | "3x"

type SelectOptionsProps = {
  selectby: SelectOptions
  setQueryParams: (name: string, value: SelectOptions) => void
}

const Payment = (
  {
    cart,
  }: {
    cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null
  },
  { setQueryParams, selectby }: SelectOptionsProps
) => {
  const [isLoading, setisLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cpf, setCpf] = useState(cart?.shipping_address?.metadata?.cpf || "")

  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "payment"

  useEffect(() => {
    setisLoading(false)
    setError(null)
  }, [isOpen])

  useEffect(() => {
    setCpf(cart?.shipping_address?.metadata?.cpf || "")
  }, [cart?.shipping_address?.metadata?.cpf])

  return (
    <div className="flex flex-col gap-4">
      <h2
        className={clx("text-3xl font-medium", {
          "opacity-50 pointer-events-none select-none": !isOpen,
        })}
      >
        Payment
      </h2>
      {cart?.payment_sessions.length && isOpen && (
        <div className="flex flex-col gap-4 w-full max-w-md px-2 sm:px-0">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl p-1">
              {cart?.payment_sessions?.map((item) => (
                <Tab
                  key={item.id}
                  className={({ selected }) =>
                    `flex flex-col gap-2 overflow-hidden rounded-lg items-center justify-center w-full sm:aspect-square aspect-[3/4] border-2 p-1 outline-none ${
                      selected ? "bg-gray-200 border-gray-500" : ""
                    }`
                  }
                >
                  {paymentInfoMap[item.provider_id]?.icon}
                  <p className="font-bold">
                    {paymentInfoMap[item.provider_id]?.title ||
                      item.provider_id}
                  </p>
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              {cart?.payment_sessions?.map((item) => (
                <Tab.Panel
                  key={item.id}
                  className="p-1 rounded-md flex flex-col gap-2"
                >
                  <PaymentButton cart={cart} provider_id={item.provider_id} />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  )
}

export default Payment

// "use client"

// import { useCallback, useContext, useEffect, useMemo, useState } from "react"
// import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import { RadioGroup } from "@headlessui/react"
// import ErrorMessage from "@modules/checkout/components/error-message"
// import { Cart } from "@medusajs/medusa"
// import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
// import { Button, Container, Heading, Text, Tooltip, clx } from "@medusajs/ui"
// import { CardElement } from "@stripe/react-stripe-js"
// import { StripeCardElementOptions } from "@stripe/stripe-js"

// import Divider from "@modules/common/components/divider"
// import Spinner from "@modules/common/icons/spinner"
// import PaymentContainer from "@modules/checkout/components/payment-container"
// import { setPaymentMethod } from "@modules/checkout/actions"
// import { paymentInfoMap } from "@/lib/constants"
// import { StripeContext } from "@modules/checkout/components/payment-wrapper"

// const Payment = ({
//   cart,
// }: {
//   cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null
// }) => {
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [cardBrand, setCardBrand] = useState<string | null>(null)
//   const [cardComplete, setCardComplete] = useState(false)

//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const pathname = usePathname()

//   const isOpen = searchParams.get("step") === "payment"

//   const isStripe = cart?.payment_session?.provider_id === "stripe"
//   const stripeReady = useContext(StripeContext)

//   const paymentReady =
//     cart?.payment_session && cart?.shipping_methods.length !== 0

//   const useOptions: StripeCardElementOptions = useMemo(() => {
//     return {
//       style: {
//         base: {
//           fontFamily: "Inter, sans-serif",
//           color: "#424270",
//           "::placeholder": {
//             color: "rgb(107 114 128)",
//           },
//         },
//       },
//       classes: {
//         base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out",
//       },
//     }
//   }, [])

//   const createQueryString = useCallback(
//     (name: string, value: string) => {
//       const params = new URLSearchParams(searchParams)
//       params.set(name, value)

//       return params.toString()
//     },
//     [searchParams]
//   )

//   const set = async (providerId: string) => {
//     setIsLoading(true)
//     await setPaymentMethod(providerId)
//       .catch((err) => setError(err.toString()))
//       .finally(() => {
//         if (providerId === "paypal") return
//         setIsLoading(false)
//       })
//   }

//   const handleChange = (providerId: string) => {
//     setError(null)
//     set(providerId)
//   }

//   const handleEdit = () => {
//     router.push(pathname + "?" + createQueryString("step", "payment"), {
//       scroll: false,
//     })
//   }

//   const handleSubmit = () => {
//     setIsLoading(true)
//     router.push(pathname + "?" + createQueryString("step", "review"), {
//       scroll: false,
//     })
//   }

//   useEffect(() => {
//     setIsLoading(false)
//     setError(null)
//   }, [isOpen])

//   return (
//     <div className="bg-white">
//       <div className="flex flex-row items-center justify-between mb-6">
//         <Heading
//           level="h2"
//           className={clx(
//             "flex flex-row text-3xl-regular gap-x-2 items-baseline",
//             {
//               "opacity-50 pointer-events-none select-none":
//                 !isOpen && !paymentReady,
//             }
//           )}
//         >
//           Payment
//           {!isOpen && paymentReady && <CheckCircleSolid />}
//         </Heading>
//         {!isOpen && paymentReady && (
//           <Text>
//             <button
//               onClick={handleEdit}
//               className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
//             >
//               Edit
//             </button>
//           </Text>
//         )}
//       </div>
//       <div>
//         {cart?.payment_sessions?.length ? (
//           <div className={isOpen ? "block" : "hidden"}>
//             <RadioGroup
//               value={cart.payment_session?.provider_id || ""}
//               onChange={(value: string) => handleChange(value)}
//             >
//               {cart.payment_sessions
//                 .sort((a, b) => {
//                   return a.provider_id > b.provider_id ? 1 : -1
//                 })
//                 .map((paymentSession) => {
//                   return (
//                     <PaymentContainer
//                       paymentInfoMap={paymentInfoMap}
//                       paymentSession={paymentSession}
//                       key={paymentSession.id}
//                       selectedPaymentOptionId={
//                         cart.payment_session?.provider_id || null
//                       }
//                     />
//                   )
//                 })}
//             </RadioGroup>

//             {isStripe && stripeReady && (
//               <div className="mt-5 transition-all duration-150 ease-in-out">
//                 <Text className="txt-medium-plus text-ui-fg-base mb-1">
//                   Enter your card details:
//                 </Text>

//                 <CardElement
//                   options={useOptions as StripeCardElementOptions}
//                   onChange={(e) => {
//                     setCardBrand(
//                       e.brand &&
//                         e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
//                     )
//                     setError(e.error?.message || null)
//                     setCardComplete(e.complete)
//                   }}
//                 />
//               </div>
//             )}

//             <ErrorMessage error={error} />

//             <Button
//               size="large"
//               className="mt-6"
//               onClick={handleSubmit}
//               isLoading={isLoading}
//               disabled={(isStripe && !cardComplete) || !cart.payment_session}
//             >
//               Continue to review
//             </Button>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center px-4 py-16 text-ui-fg-base">
//             <Spinner />
//           </div>
//         )}

//         <div className={isOpen ? "hidden" : "block"}>
//           {cart && paymentReady && cart.payment_session && (
//             <div className="flex items-start gap-x-1 w-full">
//               <div className="flex flex-col w-1/3">
//                 <Text className="txt-medium-plus text-ui-fg-base mb-1">
//                   Payment method
//                 </Text>
//                 <Text className="txt-medium text-ui-fg-subtle">
//                   {paymentInfoMap[cart.payment_session.provider_id]?.title ||
//                     cart.payment_session.provider_id}
//                 </Text>
//                 {process.env.NODE_ENV === "development" &&
//                   !Object.hasOwn(
//                     paymentInfoMap,
//                     cart.payment_session.provider_id
//                   ) && (
//                     <Tooltip content="You can add a user-friendly name and icon for this payment provider in 'src/modules/checkout/components/payment/index.tsx'" />
//                   )}
//               </div>
//               <div className="flex flex-col w-1/3">
//                 <Text className="txt-medium-plus text-ui-fg-base mb-1">
//                   Payment details
//                 </Text>
//                 <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
//                   <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
//                     {paymentInfoMap[cart.payment_session.provider_id]?.icon || (
//                       <CreditCard />
//                     )}
//                   </Container>
//                   <Text>
//                     {cart.payment_session.provider_id === "stripe" && cardBrand
//                       ? cardBrand
//                       : "Another step will appear"}
//                   </Text>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       <Divider className="mt-8" />
//     </div>
//   )
// }

// export default Payment

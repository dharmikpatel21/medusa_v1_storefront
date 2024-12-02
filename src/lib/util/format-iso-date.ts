const formatISODate = (isoDate: string) => {
  const date = new Date(isoDate)
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}/${String(date.getUTCFullYear()).slice(-2)}`
}

export default formatISODate

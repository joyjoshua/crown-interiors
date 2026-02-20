import { useMemo, useCallback } from 'react';

/**
 * Custom hook for real-time invoice calculations.
 *
 * Given the current form values (services array, tax toggle, tax %, discount),
 * computes and returns: subtotal, taxAmount, total.
 *
 * @param {Function} watch - React Hook Form `watch` function
 * @param {Function} setValue - React Hook Form `setValue` function
 */
const useInvoiceCalculations = (watch, setValue) => {
  const services = watch('services') || [];
  const taxEnabled = watch('tax_enabled');
  const taxPercentage = watch('tax_percentage') || 0;
  const discountAmount = watch('discount_amount') || 0;

  // Recalculate line-item amounts (qty × rate)
  const updateLineAmount = useCallback(
    (index) => {
      const qty = Number(watch(`services.${index}.quantity`)) || 0;
      const rate = Number(watch(`services.${index}.rate`)) || 0;
      const amount = parseFloat((qty * rate).toFixed(2));
      setValue(`services.${index}.amount`, amount, { shouldDirty: true });
    },
    [watch, setValue]
  );

  // Derived totals
  const calculations = useMemo(() => {
    const subtotal = services.reduce(
      (sum, s) => sum + (Number(s.amount) || 0),
      0
    );

    const taxAmount = taxEnabled
      ? parseFloat(((subtotal * Number(taxPercentage)) / 100).toFixed(2))
      : 0;

    const discount = Number(discountAmount) || 0;

    const total = parseFloat(
      Math.max(subtotal + taxAmount - discount, 0).toFixed(2)
    );

    return { subtotal, taxAmount, total };
  }, [services, taxEnabled, taxPercentage, discountAmount]);

  // Sync calculated values back to form (for submission)
  const syncToForm = useCallback(() => {
    setValue('subtotal', calculations.subtotal);
    setValue('tax_amount', calculations.taxAmount);
    setValue('total_amount', calculations.total);
  }, [calculations, setValue]);

  return {
    ...calculations,
    updateLineAmount,
    syncToForm,
  };
};

export default useInvoiceCalculations;

import { useTenant } from "../../core/context/TenantContext";
import { FadeUp } from "../../ui/Motion/FadeUp";

export const DEFAULT_TERMS = `1. GENERAL CONDITIONS
By accessing or shopping at this store, you agree to be bound by these terms. We reserve the right to refuse service to anyone, for any reason, at any time.

2. ACCURACY OF INFORMATION
We make every effort to display product colors, descriptions, and pricing as accurately as possible. However, we do not warrant that product descriptions or other content are fully error-free, complete, or current.

3. PRICING & PAYMENT
All prices are subject to change without prior notice. We reserve the right to modify or discontinue any product or service. We accept various secure payment options as indicated at checkout.

4. SHIPPING & DELIVERY
Delivery timelines are estimates and can vary depending on courier operations and external factors. Ownership and risk of loss pass to you upon delivery of the items to the carrier.

5. RETURNS & REFUNDS
Please review our returns policy. Any return or exchange request is subject to approval in accordance with applicable consumer laws of the Republic of the Philippines.

6. LIMITATION OF LIABILITY
In no event shall the store, its directors, officers, employees, or affiliates be liable for any direct, indirect, incidental, or consequential damages arising from your use of our services or products.

7. GOVERNING LAW
These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of the Philippines.`;

export function TermsConditionsPage() {
  const { tenant } = useTenant();
  const brandName = tenant?.name || "Our Store";
  const settings = (tenant?.store_settings as any) || {};
  const customTerms = settings.terms;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface-white">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <h1 className="text-2xl font-sans font-light tracking-widest uppercase text-typography-primary mb-4">
            Terms & Conditions
          </h1>
          <div className="w-12 h-px bg-typography-primary mb-6"></div>
          <p className="max-w-md text-xs tracking-wider text-typography-muted uppercase">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <FadeUp delay={0.1}>
          <div className="prose prose-sm max-w-none text-typography-primary font-light leading-relaxed space-y-8 text-sm">
            
            <p>
              Welcome to <span className="font-semibold">{brandName}</span>. These terms and conditions outline the rules and regulations for the use of our website and services.
            </p>

            {customTerms ? (
              <div className="whitespace-pre-wrap font-light tracking-wide text-xs text-typography-muted leading-relaxed">
                {customTerms}
              </div>
            ) : (
              <div className="space-y-6">
                {DEFAULT_TERMS.split("\n\n").map((paragraph, index) => {
                  const firstLineBreak = paragraph.indexOf("\n");
                  if (firstLineBreak !== -1) {
                    const title = paragraph.substring(0, firstLineBreak);
                    const body = paragraph.substring(firstLineBreak + 1);
                    return (
                      <div key={index} className="space-y-2">
                        <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-typography-primary">
                          {title}
                        </h2>
                        <p className="text-typography-muted tracking-wide text-xs leading-relaxed">
                          {body}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <p key={index} className="text-typography-muted tracking-wide text-xs leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            )}

            <div className="border-t border-surface-light pt-8 mt-12">
              <p className="text-[10px] text-typography-muted tracking-wider uppercase text-center">
                If you have any questions about these Terms & Conditions, please contact our support team.
              </p>
            </div>

          </div>
        </FadeUp>

      </div>
    </div>
  );
}

export default TermsConditionsPage;

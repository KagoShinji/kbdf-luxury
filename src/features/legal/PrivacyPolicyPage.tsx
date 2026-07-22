import { useTenant } from "../../core/context/TenantContext";
import { FadeUp } from "../../ui/Motion/FadeUp";

export function PrivacyPolicyPage() {
  const { tenant } = useTenant();
  const brandName = tenant?.name || "Our Store";
  const settings = (tenant?.store_settings as any) || {};
  const dpoContact = settings.privacy_contact || settings.email || "privacy@yourstore.com";

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface-white">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <h1 className="text-2xl font-sans font-light tracking-widest uppercase text-typography-primary mb-4">
            Privacy Policy
          </h1>
          <div className="w-12 h-px bg-typography-primary mb-6"></div>
          <p className="max-w-md text-xs tracking-wider text-typography-muted uppercase">
            In compliance with Republic Act No. 10173 (DPA of the Philippines)
          </p>
        </div>

        <FadeUp delay={0.1}>
          <div className="prose prose-sm max-w-none text-typography-primary font-light leading-relaxed space-y-8 text-sm">
            
            <p>
              At <span className="font-semibold">{brandName}</span>, we are committed to protecting and respecting your personal data privacy in compliance with **Republic Act No. 10173**, otherwise known as the **Data Privacy Act of 2012 of the Philippines** (DPA).
            </p>

            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-typography-primary border-b border-surface-light pb-2">
                1. Information We Collect
              </h2>
              <p className="text-typography-muted text-xs leading-relaxed">
                We collect personal information that you voluntarily provide to us when you register, place an order, or contact us. This includes:
              </p>
              <ul className="list-disc pl-5 text-typography-muted text-xs space-y-1">
                <li>**Identity Data**: Name, gender, and date of birth.</li>
                <li>**Contact Data**: Delivery address, billing address, email address, and phone numbers.</li>
                <li>**Transaction Data**: Details about products purchased, order values, and cart activities.</li>
                <li>**Financial Data**: Payment details processed securely by third-party payment gateways. We do not store raw credit card info.</li>
                <li>**Technical Data**: IP address, login data, browser type, and cookie usage.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-typography-primary border-b border-surface-light pb-2">
                2. Processing of Personal Information
              </h2>
              <p className="text-typography-muted text-xs leading-relaxed">
                Your personal data is processed solely for the following legitimate purposes:
              </p>
              <ul className="list-disc pl-5 text-typography-muted text-xs space-y-1">
                <li>To process, pack, ship, and deliver the items you purchase.</li>
                <li>To provide order tracking updates, customer care support, and handle returns.</li>
                <li>To prevent fraud, verify transactions, and maintain system security.</li>
                <li>With your explicit consent, to send you newsletter updates or custom promotions.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-typography-primary border-b border-surface-light pb-2">
                3. Third-Party Disclosures
              </h2>
              <p className="text-typography-muted text-xs leading-relaxed">
                We may share your data with trusted partners strictly to facilitate our services (e.g., third-party logistics/couriers for delivery, payment processors). We ensure all partners adhere to the strict privacy guidelines defined under the Philippine Data Privacy Act.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-typography-primary border-b border-surface-light pb-2">
                4. Data Storage & Security
              </h2>
              <p className="text-typography-muted text-xs leading-relaxed">
                We implement technical, organizational, and physical security measures designed to protect your personal information against loss, theft, unauthorized access, or modification. Your data is retained only as long as necessary to fulfill business transactions or comply with legislative retention limits (such as tax compliance regulations).
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-typography-primary border-b border-surface-light pb-2">
                5. Your Rights as a Data Subject
              </h2>
              <p className="text-typography-muted text-xs leading-relaxed">
                Under the Data Privacy Act of 2012 of the Philippines, you are entitled to the following rights:
              </p>
              <ul className="list-disc pl-5 text-typography-muted text-xs space-y-2">
                <li>**Right to be Informed**: Knowing whether your personal data is being processed.</li>
                <li>**Right to Access**: Requesting a copy of your personal data stored in our systems.</li>
                <li>**Right to Rectification**: Correcting any inaccuracies in your personal records.</li>
                <li>**Right to Erasure or Blocking**: Having your data deleted or removed under reasonable grounds.</li>
                <li>**Right to File a Complaint**: Lodging complaints directly with the **National Privacy Commission (NPC)** if your data privacy rights are violated.</li>
              </ul>
            </div>

            <div className="space-y-4 border-t border-surface-light pt-6">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-typography-primary">
                6. Contact Our Data Protection Officer (DPO)
              </h2>
              <p className="text-typography-muted text-xs leading-relaxed">
                For any inquiries, requests to exercise your rights, or clarifications regarding our privacy practices, please contact our designated Data Protection contact at:
              </p>
              <p className="text-typography-primary text-xs font-semibold bg-surface-offWhite p-3 rounded-lg border border-surface-light w-max">
                {dpoContact}
              </p>
            </div>

          </div>
        </FadeUp>

      </div>
    </div>
  );
}

export default PrivacyPolicyPage;

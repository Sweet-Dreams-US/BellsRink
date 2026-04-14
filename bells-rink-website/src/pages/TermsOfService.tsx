import React from 'react';
import './TermsOfService.css';

const TermsOfService: React.FC = () => {
  return (
    <div className="terms-of-service">
      {/* Hero Section */}
      <section className="legal-hero">
        <div className="container">
          <h1>Terms of Service</h1>
          <p className="legal-date">Effective Date: February 8, 2026</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="legal-content">
        <div className="container">
          <div className="legal-document">

            <div className="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By entering Bell's Skating Rink located at 7009 IN-930, Fort Wayne, IN 46803,
                you agree to comply with and be bound by these Terms of Service. If you do not
                agree to these terms, please do not use our facility.
              </p>
            </div>

            <div className="legal-section">
              <h2>2. Use of Facility</h2>
              <p>
                Bell's Skating Rink provides roller skating entertainment for individuals and
                families. All guests must follow facility rules and staff instructions.
              </p>
              <h3>Skating Rules</h3>
              <ul>
                <li>Skating is strictly supervised to ensure safety of all skaters</li>
                <li>Fast or reckless skating is prohibited</li>
                <li>Weaving through crowds and putting others in danger is not permitted</li>
                <li>Playing tag or roughhousing on skates is prohibited</li>
                <li>Skaters must skate within their ability level</li>
                <li>Follow all posted signs and staff directions</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>3. Assumption of Risk & Waiver</h2>
              <div className="legal-highlight">
                <p>
                  <strong>IMPORTANT:</strong> Roller skating is a physical activity that carries
                  inherent risks. By participating in roller skating at Bell's Skating Rink, you
                  acknowledge and assume all risks associated with the activity, including but
                  not limited to:
                </p>
                <ul>
                  <li>Falls and collisions with other skaters or objects</li>
                  <li>Injuries including sprains, fractures, and bruises</li>
                  <li>Equipment-related injuries</li>
                  <li>Other physical injuries or property damage</li>
                </ul>
                <p>
                  <strong>Bell's Skating Rink, its owners, employees, and agents are not responsible
                  for accidents or injuries that occur on the premises. You skate at your own risk.</strong>
                </p>
              </div>
            </div>

            <div className="legal-section">
              <h2>4. Age Requirements & Supervision</h2>
              <h3>Minors</h3>
              <p>
                Children under 18 years of age must have parental consent to skate. Parents or
                legal guardians are responsible for the safety and conduct of their children.
              </p>
              <h3>In/Out Privileges</h3>
              <p>
                No in/out privileges are permitted for anyone under 18 years old for safety
                and security reasons.
              </p>
            </div>

            <div className="legal-section">
              <h2>5. Party Reservations & Cancellations</h2>
              <h3>Reservations</h3>
              <p>
                Birthday party reservations require advance booking and may require a deposit.
                Party packages are subject to availability.
              </p>
              <h3>Cancellations</h3>
              <p>
                Cancellation policies vary by package. Please contact us at (260) 749-8214 or
                (260) 403-3766 for specific cancellation terms.
              </p>
              <h3>Food Policy</h3>
              <p>
                Outside food and beverages are not permitted except for guests hosting a
                birthday party reservation.
              </p>
            </div>

            <div className="legal-section">
              <h2>6. Payment Terms</h2>
              <p>
                All prices are subject to change. Current pricing is displayed at the facility
                and on our website.
              </p>
            </div>

            <div className="legal-section">
              <h2>7. Prohibited Conduct</h2>
              <p>
                The following behaviors are strictly prohibited and may result in immediate
                removal from the premises:
              </p>
              <ul>
                <li><strong>Bullying or harassment</strong> of any kind</li>
                <li><strong>Violence or threats</strong> toward others</li>
                <li><strong>Possession or consumption</strong> of alcohol or illegal drugs</li>
                <li><strong>Being under the influence</strong> of drugs or alcohol</li>
                <li><strong>Offensive language</strong> or behavior</li>
                <li><strong>Inappropriate clothing</strong> with offensive language, imagery promoting violence, drugs, or alcohol</li>
                <li><strong>Loitering</strong> in common areas</li>
                <li><strong>Theft or vandalism</strong></li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>8. Dress Code</h2>
              <p>
                Casual dress is acceptable. Bell's Skating Rink dress codes are dictated by
                good taste and family-friendly standards. We reserve the right to refuse entry
                to anyone wearing inappropriate attire.
              </p>
            </div>

            <div className="legal-section">
              <h2>9. Liability Limitations</h2>
              <p>
                To the maximum extent permitted by law, Bell's Skating Rink and its owners,
                employees, and agents shall not be liable for:
              </p>
              <ul>
                <li>Personal injuries sustained while on the premises</li>
                <li>Loss or theft of personal property</li>
                <li>Damages to vehicles in the parking lot</li>
                <li>Injuries caused by other guests</li>
              </ul>
              <p>
                By using our facility, you agree to release and hold harmless Bell's Skating
                Rink from any and all claims, liabilities, and damages arising from your use
                of the facility.
              </p>
            </div>

            <div className="legal-section">
              <h2>10. Right to Refuse Service</h2>
              <p>
                Bell's Skating Rink reserves the right to refuse service to anyone for any
                reason, including but not limited to:
              </p>
              <ul>
                <li>Violation of these Terms of Service</li>
                <li>Violation of facility rules and policies</li>
                <li>Disruptive or dangerous behavior</li>
                <li>Failure to follow staff instructions</li>
              </ul>
              <p>
                Management has final say in all matters concerning facility use and guest conduct.
              </p>
            </div>

            <div className="legal-section">
              <h2>11. Photography & Video</h2>
              <p>
                By entering Bell's Skating Rink, you consent to being photographed or recorded
                for promotional purposes. If you do not wish to be photographed, please notify
                staff immediately.
              </p>
            </div>

            <div className="legal-section">
              <h2>12. SMS/Text Message Marketing Terms</h2>
              <h3>Program Name</h3>
              <p>
                Bell's Skating Rink Text Alerts
              </p>
              <h3>Program Description</h3>
              <p>
                By opting in to Bell's Skating Rink Text Alerts, you agree to receive recurring
                automated promotional and informational text messages from Bell's Skating Rink.
                Messages may include special event announcements, schedule updates, exclusive deals
                and promotions, and general rink announcements.
              </p>
              <h3>Message Frequency</h3>
              <p>
                Message frequency varies. You may receive up to 10 text messages per month.
              </p>
              <h3>Message and Data Rates</h3>
              <p>
                <strong>Message and data rates may apply.</strong> Please contact your wireless
                carrier for details about your messaging plan. Bell's Skating Rink is not
                responsible for any charges incurred from your carrier.
              </p>
              <h3>Opt-In</h3>
              <p>
                You may opt in to receive text messages from Bell's Skating Rink by:
              </p>
              <ul>
                <li>Providing your phone number on our website at bellsrink.com and checking the box agreeing to receive text messages</li>
                <li>Texting <strong>START</strong> or <strong>JOIN</strong> to our designated number</li>
              </ul>
              <p>
                By opting in, you confirm that you are the owner or authorized user of the mobile
                device and phone number provided, and that you consent to receive text messages
                from Bell's Skating Rink. Consent is not a condition of any purchase.
              </p>
              <h3>Opt-Out</h3>
              <p>
                You can cancel text messages at any time. To stop receiving messages, text
                <strong> STOP</strong> to any message you receive from Bell's Skating Rink. After
                sending STOP, you will receive one final confirmation message. No further messages
                will be sent unless you re-subscribe.
              </p>
              <h3>Help</h3>
              <p>
                If you are experiencing issues with our text message program, reply
                <strong> HELP</strong> to any message for assistance, or contact us directly at
                (260) 749-8214.
              </p>
              <h3>Privacy</h3>
              <p>
                Your privacy is important to us. We will not sell, share, or rent your mobile
                phone number to any third parties for marketing purposes. For full details, see
                our <a href="/privacy">Privacy Policy</a>. Carriers are not liable for delayed
                or undelivered messages.
              </p>
              <h3>Supported Carriers</h3>
              <p>
                Our text message program is supported by all major US carriers including AT&T,
                Verizon, T-Mobile, Sprint, and others. However, service availability may vary
                by carrier.
              </p>
            </div>

            <div className="legal-section">
              <h2>13. Changes to Terms</h2>
              <p>
                Bell's Skating Rink reserves the right to modify these Terms of Service at any
                time. Changes will be effective immediately upon posting. Your continued use of
                the facility constitutes acceptance of any modified terms.
              </p>
            </div>

            <div className="legal-section">
              <h2>14. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the
                laws of the State of Indiana, without regard to its conflict of law provisions.
              </p>
            </div>

            <div className="legal-section">
              <h2>15. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="contact-info">
                <p><strong>Bell's Skating Rink</strong></p>
                <p>7009 IN-930, Fort Wayne, IN 46803</p>
                <p>Phone: (260) 749-8214</p>
                <p>Phone: (260) 403-3766</p>
                <p>Owners: Eric & Stacy Dunlap</p>
              </div>
            </div>

            <div className="legal-footer">
              <p>
                By using Bell's Skating Rink, you acknowledge that you have read, understood,
                and agree to be bound by these Terms of Service.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;

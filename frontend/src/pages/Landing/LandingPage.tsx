import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Fuel,
  Globe,
  Map as MapIcon,
  Menu,
  Sprout,
  Tractor,
  Users,
  Warehouse,
  Wheat,
  X,
  Quote,
} from 'lucide-react';
import { useTranslation, languages } from '../../i18n';
import type { Lang } from '../../stores/langStore';
import Logo from '../../components/Logo';
import s from './LandingPage.module.css';

const FEATURE_ICONS = [Wheat, Tractor, Warehouse, BarChart3, Sprout, MapIcon, Fuel, Users] as const;

export default function LandingPage() {
  const { t, lang, setLang } = useTranslation();
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const year = new Date().getFullYear();
  const L = t.landing;

  useEffect(() => {
    if (!mobileNav) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNav(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileNav]);

  const goLogin = () => navigate('/login');

  const features = [
    { title: L.feature1Title, desc: L.feature1Desc },
    { title: L.feature2Title, desc: L.feature2Desc },
    { title: L.feature3Title, desc: L.feature3Desc },
    { title: L.feature4Title, desc: L.feature4Desc },
    { title: L.feature5Title, desc: L.feature5Desc },
    { title: L.feature6Title, desc: L.feature6Desc },
    { title: L.feature7Title, desc: L.feature7Desc },
    { title: L.feature8Title, desc: L.feature8Desc },
  ];

  const stats = [
    { value: L.stat1Value, label: L.stat1Label },
    { value: L.stat2Value, label: L.stat2Label },
    { value: L.stat3Value, label: L.stat3Label },
    { value: L.stat4Value, label: L.stat4Label },
  ];

  const tiers = [
    {
      id: 'starter',
      name: L.priceStarterName,
      tagline: L.priceStarterTagline,
      price: L.priceStarterPrice,
      period: L.priceStarterPeriod,
      cta: L.priceStarterCta,
      highlighted: false,
      features: [
        L.priceStarterF1,
        L.priceStarterF2,
        L.priceStarterF3,
        L.priceStarterF4,
        L.priceStarterF5,
      ],
    },
    {
      id: 'pro',
      name: L.priceProName,
      tagline: L.priceProTagline,
      price: L.priceProPrice,
      period: L.priceProPeriod,
      cta: L.priceProCta,
      highlighted: true,
      features: [
        L.priceProF1,
        L.priceProF2,
        L.priceProF3,
        L.priceProF4,
        L.priceProF5,
        L.priceProF6,
      ],
    },
    {
      id: 'enterprise',
      name: L.priceEnterpriseName,
      tagline: L.priceEnterpriseTagline,
      price: L.priceEnterprisePrice,
      period: L.priceEnterprisePeriod,
      cta: L.priceEnterpriseCta,
      highlighted: false,
      features: [
        L.priceEnterpriseF1,
        L.priceEnterpriseF2,
        L.priceEnterpriseF3,
        L.priceEnterpriseF4,
        L.priceEnterpriseF5,
        L.priceEnterpriseF6,
      ],
    },
  ];

  const testimonials = [
    { quote: L.tm1Quote, name: L.tm1Name, role: L.tm1Role, farm: L.tm1Farm },
    { quote: L.tm2Quote, name: L.tm2Name, role: L.tm2Role, farm: L.tm2Farm },
    { quote: L.tm3Quote, name: L.tm3Name, role: L.tm3Role, farm: L.tm3Farm },
  ];

  const faqs = [
    { q: L.faq1Q, a: L.faq1A },
    { q: L.faq2Q, a: L.faq2A },
    { q: L.faq3Q, a: L.faq3A },
    { q: L.faq4Q, a: L.faq4A },
    { q: L.faq5Q, a: L.faq5A },
    { q: L.faq6Q, a: L.faq6A },
  ];

  const footerCols = [
    {
      title: L.footerCol1Title,
      links: [
        { label: L.footerCol1L1, href: '#features' },
        { label: L.footerCol1L2, href: '#pricing' },
        { label: L.footerCol1L3, href: null },
        { label: L.footerCol1L4, href: null },
      ],
    },
    {
      title: L.footerCol2Title,
      links: [
        { label: L.footerCol2L1, href: null },
        { label: L.footerCol2L2, href: '#testimonials' },
        { label: L.footerCol2L3, href: null },
        { label: L.footerCol2L4, href: 'mailto:hello@agrotech.ua' },
      ],
    },
    {
      title: L.footerCol3Title,
      links: [
        { label: L.footerCol3L1, href: null },
        { label: L.footerCol3L2, href: '#faq' },
        { label: L.footerCol3L3, href: null },
        { label: L.footerCol3L4, href: null },
      ],
    },
    {
      title: L.footerCol4Title,
      links: [
        { label: L.footerCol4L1, href: null },
        { label: L.footerCol4L2, href: null },
        { label: L.footerCol4L3, href: null },
        { label: L.footerCol4L4, href: null },
      ],
    },
  ];

  return (
    <div className={s.page}>
      <div className={s.canvasGlow} aria-hidden />

      {/* Top nav */}
      <header className={s.nav}>
        <div className={s.navInner}>
          <a href="#top" className={s.navLogo} aria-label={L.a11yBrand}>
            <Logo size={28} variant="full" />
          </a>

          <nav className={s.navLinks} aria-label={L.a11yPrimaryNav}>
            <a href="#features" className={s.navLink}>{L.navFeatures}</a>
            <a href="#pricing" className={s.navLink}>{L.navPricing}</a>
            <a href="#testimonials" className={s.navLink}>{L.navTestimonials}</a>
            <a href="#faq" className={s.navLink}>{L.navFaq}</a>
          </nav>

          <div className={s.navActions}>
            <LangToggle lang={lang} onChange={setLang} ariaLabel={L.a11yLanguage} />
            <button type="button" className={s.btnGhostSm} onClick={goLogin}>
              {L.ctaLogin}
            </button>
            <button type="button" className={s.btnPrimarySm} onClick={goLogin}>
              {L.ctaStart}
            </button>
            <button
              type="button"
              className={s.navMenu}
              aria-label={L.a11yMenu}
              onClick={() => setMobileNav(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {mobileNav && (
        <div className={s.mobileSheet} role="dialog" aria-modal="true">
          <div className={s.mobileSheetHead}>
            <Logo size={26} variant="full" />
            <button type="button" className={s.iconBtn} onClick={() => setMobileNav(false)} aria-label={L.a11yClose}>
              <X size={18} />
            </button>
          </div>
          <nav className={s.mobileLinks}>
            <a href="#features" onClick={() => setMobileNav(false)}>{L.navFeatures}</a>
            <a href="#pricing" onClick={() => setMobileNav(false)}>{L.navPricing}</a>
            <a href="#testimonials" onClick={() => setMobileNav(false)}>{L.navTestimonials}</a>
            <a href="#faq" onClick={() => setMobileNav(false)}>{L.navFaq}</a>
          </nav>
          <div className={s.mobileFoot}>
            <LangToggle lang={lang} onChange={setLang} ariaLabel={L.a11yLanguage} />
            <button type="button" className={s.btnPrimary} onClick={() => { setMobileNav(false); goLogin(); }}>
              {L.ctaStart}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <main id="top">
        {/* Hero */}
        <section className={s.hero}>
          <div className={s.heroOrb} aria-hidden />
          <div className={s.heroOrb2} aria-hidden />

          <div className={s.heroInner}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowDot} />
              {L.eyebrow}
            </span>

            <h1 className={s.heroTitle}>
              {L.heroTitle}
              <span className={s.heroTitleAccent}> {L.heroTitleAccent}</span>
            </h1>

            <p className={s.heroSubtitle}>{L.heroSubtitle}</p>

            <div className={s.heroActions}>
              <button type="button" className={s.btnPrimary} onClick={goLogin}>
                {L.ctaStart}
                <ArrowRight size={16} />
              </button>
              <a href="#features" className={s.btnGhost}>
                {L.ctaLearnMore}
              </a>
            </div>

            <div className={s.heroMeta}>
              <span className={s.heroMetaItem}><Check size={13} />{L.heroMeta1}</span>
              <span className={s.heroMetaItem}><Check size={13} />{L.heroMeta2}</span>
              <span className={s.heroMetaItem}><Check size={13} />{L.heroMeta3}</span>
            </div>

            {/* Product preview */}
            <div className={s.preview} aria-hidden="true">
              <div className={s.previewBar}>
                <span className={s.previewDot} />
                <span className={s.previewDot} style={{ background: 'var(--text-tertiary)' }} />
                <span className={s.previewDot} style={{ background: 'var(--text-quaternary, var(--text-tertiary))' }} />
                <span className={s.previewCrumbs}>
                  {L.previewCrumb1} <span className={s.previewCrumbSep}>/</span> {L.previewCrumb2} <span className={s.previewCrumbSep}>/</span> <span className={s.previewCrumbActive}>{L.previewCrumb3}</span>
                </span>
                <span className={s.previewLive}>
                  <span className={s.previewLiveDot} />
                  {L.previewLive}
                </span>
              </div>
              <div className={s.previewContent}>
                <div className={s.previewKpis}>
                  <div className={s.previewKpi}>
                    <div className={s.previewKpiLabel}>{L.previewKpi1Label}</div>
                    <div className={s.previewKpiValue}>{L.previewKpi1Value}</div>
                    <div className={s.previewKpiDelta}>+12 {L.previewVs}</div>
                  </div>
                  <div className={s.previewKpi}>
                    <div className={s.previewKpiLabel}>{L.previewKpi2Label}</div>
                    <div className={s.previewKpiValue}>{L.previewKpi2Value}</div>
                    <div className={s.previewKpiDelta}>+8.4 % {L.previewVs}</div>
                  </div>
                  <div className={s.previewKpi}>
                    <div className={s.previewKpiLabel}>{L.previewKpi3Label}</div>
                    <div className={s.previewKpiValue}>{L.previewKpi3Value}</div>
                    <div className={`${s.previewKpiDelta} ${s.previewKpiDeltaDown}`}>−3.1 % {L.previewVs}</div>
                  </div>
                  <div className={s.previewKpi}>
                    <div className={s.previewKpiLabel}>{L.previewKpi4Label}</div>
                    <div className={s.previewKpiValue}>{L.previewKpi4Value}</div>
                    <div className={s.previewKpiDelta}>+2.6 {L.previewPp}</div>
                  </div>
                </div>
                <div className={s.previewChart}>
                  <div className={s.previewChartHead}>
                    <span className={s.previewChartTitle}>{L.previewChartTitle}</span>
                    <span className={s.previewChartRange}>{L.previewChartRange}</span>
                  </div>
                  <svg viewBox="0 0 600 140" preserveAspectRatio="none" className={s.previewSvg}>
                    <defs>
                      <linearGradient id="previewFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#22C55E" stopOpacity="0.35" />
                        <stop offset="1" stopColor="#22C55E" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[20, 50, 80, 110].map((y) => (
                      <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(255,255,255,0.04)" />
                    ))}
                    <path
                      d="M0 110 L50 95 L100 100 L150 80 L200 86 L250 60 L300 70 L350 48 L400 55 L450 32 L500 40 L550 22 L600 28 L600 140 L0 140 Z"
                      fill="url(#previewFill)"
                    />
                    <path
                      d="M0 110 L50 95 L100 100 L150 80 L200 86 L250 60 L300 70 L350 48 L400 55 L450 32 L500 40 L550 22 L600 28"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {[
                      [50, 95], [150, 80], [250, 60], [350, 48], [450, 32], [550, 22],
                    ].map(([x, y]) => (
                      <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#0a0a0a" stroke="#22C55E" strokeWidth="1.5" />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className={s.stats} aria-label={L.a11yStats}>
          <div className={s.statsInner}>
            {stats.map((stat) => (
              <div key={stat.label} className={s.statItem}>
                <div className={s.statValue}>{stat.value}</div>
                <div className={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Trustbar */}
        <section className={s.trustbar} aria-label="Trusted by">
          <div className={s.trustbarLabel}>Довіряють провідні агропідприємства</div>
          <div className={s.trustbarLogos}>
            {[
              { name: "Кернел Груп", color: "#F59E0B" },
              { name: "МХП", color: "#22C55E" },
              { name: "Астарта", color: "#3B82F6" },
              { name: "Нібулон", color: "#A855F7" },
              { name: "АграрМаркет", color: "#14B8A6" },
              { name: "УкрАгро", color: "#F97316" },
            ].map((c) => (
              <div key={c.name} className={s.trustbarItem}>
                <span className={s.trustbarDot} style={{ background: c.color }} />
                {c.name}
              </div>
            ))}
          </div>
        </section>
        {/* Features */}
        <section id="features" className={s.section}>
          <div className={s.sectionHead}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowDot} />
              {L.featuresEyebrow}
            </span>
            <h2 className={s.sectionTitle}>{L.featuresTitleHero}</h2>
            <p className={s.sectionSubtitle}>{L.featuresSubtitle}</p>
          </div>

          <div className={s.featureGrid}>
            {features.map((f, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <article key={f.title} className={s.featureCard}>
                  <div className={s.glyph}>
                    <Icon size={16} strokeWidth={1.6} />
                  </div>
                  <h3 className={s.featureTitle}>{f.title}</h3>
                  <p className={s.featureDesc}>{f.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className={s.section}>
          <div className={s.sectionHead}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowDot} />
              {L.pricingEyebrow}
            </span>
            <h2 className={s.sectionTitle}>{L.pricingTitle}</h2>
            <p className={s.sectionSubtitle}>{L.pricingSubtitle}</p>
          </div>

          <div className={s.pricingGrid}>
            {tiers.map((tier) => (
              <article
                key={tier.id}
                className={`${s.priceCard} ${tier.highlighted ? s.priceCardActive : ''}`}
              >
                {tier.highlighted && <span className={s.priceBadge}>{L.pricingRecommended}</span>}
                <div className={s.priceHead}>
                  <h3 className={s.priceName}>{tier.name}</h3>
                  <p className={s.priceTagline}>{tier.tagline}</p>
                </div>
                <div className={s.priceAmountRow}>
                  <span className={s.priceAmount}>{tier.price}</span>
                  {tier.period && <span className={s.pricePeriod}>{tier.period}</span>}
                </div>
                <button
                  type="button"
                  className={tier.highlighted ? s.btnPrimary : s.btnGhost}
                  onClick={goLogin}
                >
                  {tier.cta}
                </button>
                <ul className={s.priceFeatures}>
                  {tier.features.map((feat) => (
                    <li key={feat} className={s.priceFeature}>
                      <Check size={14} className={s.priceCheck} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className={s.section}>
          <div className={s.sectionHead}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowDot} />
              {L.testimonialsEyebrow}
            </span>
            <h2 className={s.sectionTitle}>{L.testimonialsTitle}</h2>
            <p className={s.sectionSubtitle}>{L.testimonialsSubtitle}</p>
          </div>

          <div className={s.testimonialGrid}>
            {testimonials.map((q) => (
              <figure key={q.name} className={s.testimonialCard}>
                <Quote size={18} className={s.testimonialGlyph} strokeWidth={1.6} />
                <blockquote className={s.testimonialText}>{q.quote}</blockquote>
                <figcaption className={s.testimonialFoot}>
                  <span className={s.avatar} aria-hidden>
                    {q.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </span>
                  <span className={s.testimonialMeta}>
                    <span className={s.testimonialName}>{q.name}</span>
                    <span className={s.testimonialRole}>{q.role} · {q.farm}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={s.section}>
          <div className={s.sectionHead}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowDot} />
              {L.faqEyebrow}
            </span>
            <h2 className={s.sectionTitle}>{L.faqTitle}</h2>
            <p className={s.sectionSubtitle}>{L.faqSubtitle}</p>
          </div>

          <div className={s.faqList}>
            {faqs.map((item, i) => {
              const open = openFaq === i;
              const num = String(i + 1).padStart(2, '0');
              const panelId = `faq-panel-${i}`;
              return (
                <div key={item.q} className={`${s.faqItem} ${open ? s.faqItemOpen : ''}`}>
                  <button
                    type="button"
                    className={s.faqHead}
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={panelId}
                  >
                    <span className={s.faqNum}>{num}</span>
                    <span className={s.faqQ}>{item.q}</span>
                    <ChevronDown size={16} className={s.faqChevron} />
                  </button>
                  {open && <div id={panelId} className={s.faqA}>{item.a}</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Band */}
        <section className={s.ctaBand}>
          <div className={s.ctaBandGlow} aria-hidden />
          <div className={s.ctaBandInner}>
            <h2 className={s.ctaBandTitle}>{L.ctaBandTitle}</h2>
            <p className={s.ctaBandSubtitle}>{L.ctaBandSubtitle}</p>
            <div className={s.heroActions}>
              <button type="button" className={s.btnPrimary} onClick={goLogin}>
                {L.ctaStart}
                <ArrowRight size={16} />
              </button>
              <a href="mailto:hello@agrotech.ua" className={s.btnGhost}>
                {L.ctaContact}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerBrand}>
            <Logo size={28} variant="full" />
            <p className={s.footerTagline}>{L.footerTagline}</p>
            <div className={s.socials} aria-label={L.a11ySocials}>
              <a className={s.iconBtn} href="https://x.com/" target="_blank" aria-label="Twitter / X" rel="noopener noreferrer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
                </svg>
              </a>
              <a className={s.iconBtn} href="https://github.com/" target="_blank" aria-label="GitHub" rel="noopener noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.77 2.7 1.26 3.36.96.1-.74.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.15v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
                </svg>
              </a>
              <a className={s.iconBtn} href="https://www.linkedin.com/" target="_blank" aria-label="LinkedIn" rel="noopener noreferrer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.38 4.27 5.47v6.27ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
                </svg>
              </a>
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title} className={s.footerCol}>
              <div className={s.footerColTitle}>{col.title}</div>
              <ul className={s.footerColList}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a href={link.href} className={s.footerLink}>{link.label}</a>
                    ) : (
                      <span className={`${s.footerLink} ${s.footerLinkMuted}`} aria-disabled="true">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={s.footerBottom}>
          <span className={s.footerCopy}>
            {L.footerText.replace('{year}', String(year))}
            <span className={s.footerVersion}> · v1.0.0</span>
          </span>
          <div className={s.footerLang}>
            <Globe size={13} />
            <LangToggle lang={lang} onChange={setLang} ariaLabel={L.a11yLanguage} />
          </div>
        </div>
      </footer>
    </div>
  );
}

function LangToggle({
  lang,
  onChange,
  ariaLabel,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className={s.langToggle}>
      {languages.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code as Lang)}
            aria-pressed={active}
            className={`${s.langPill} ${active ? s.langPillActive : ''}`}
          >
            {l.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

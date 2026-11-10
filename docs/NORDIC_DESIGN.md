# Nordic winter interface

The November 2026 redesign supersedes the former warm-green palette, system font, tiny metadata, and shadow-free cards. Existing route behavior and service contracts are unchanged.

Shared tokens live in the existing design layer, with cross-route refinements in the Nordic stylesheet. Route CSS modules consume the same tokens; no backend or authentication styles depend on new libraries.

| Purpose | Color |
|---|---|
| Page / inset / card | #F8FAFC / #EAF2F5 / #FFFFFF |
| Navigation / headings | #163247 |
| Actions / links | #176B73 |
| Body / secondary text | #172B36 / #475569 |
| Card border / field border | #D6E2E8 / #6C8392 |
| Success / warning / emergency | #166534 / #92400E / #B42332 |

Geist is locally hosted under the SIL Open Font License; no browser font requests go to a third party. Titles are 28–32px, section headings 20–24px, body text 16px, and secondary information at least 14px. Cards use 16px corners and a restrained navy shadow. Contours are decorative CSS in the light operations header, never a background for critical information.

Medical alerts have an explicit label and amber treatment. Active missing incidents have red treatment and status text. Reporting links are outlined red; actual emergency submission uses solid red. Ordinary patrol actions use teal. No status relies on color alone.

Controls have dark field borders, readable placeholders, visible focus, and solid disabled colors without reduced opacity. Instructor actions remain at least 48px tall. Responsive headers wrap; emergency fact lists stack on phones; print output removes navigation and decorative contours. Reduced-motion and forced-color settings are respected.

The Nordic browser check covers all five dashboards at 375px and 1280px, computed text contrast, local font loading, navigation, focus, and overflow. Existing missing-child and patrol scenarios verify the unchanged workflows. Automated contrast approximates solid backgrounds; outdoor glare still needs a physical-device check.

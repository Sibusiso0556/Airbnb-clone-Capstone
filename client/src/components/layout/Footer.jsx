import './Footer.css';

const COLUMNS = [
  {
    title: 'Support',
    links: [
      'Help Center',
      'Safety information',
      'Cancellation options',
      'Our COVID-19 Response',
      'Supporting people with disabilities',
      'Report a neighborhood concern',
    ],
  },
  {
    title: 'Community',
    links: [
      'Airbnb.org: disaster relief housing',
      'Support: Afghan refugees',
      'Celebrating diversity & belonging',
      'Combating discrimination',
    ],
  },
  {
    title: 'Hosting',
    links: [
      'Try hosting',
      'AirCover: protection for Hosts',
      'Explore hosting resources',
      'Visit our community forum',
      'How to host responsibly',
    ],
  },
  {
    title: 'About',
    links: ['Newsroom', 'Learn about new features', 'Letter from our founders', 'Careers', 'Investors', 'Airbnb Luxe'],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__columns">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Airbnb, Inc. · Privacy · Terms · Sitemap</span>
        <span className="footer__meta">🌐 English (US) · $ USD</span>
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/listing/SearchBar';
import ListingCard from '../components/listing/ListingCard';
import CityCard from '../components/common/CityCard';
import { useListings } from '../hooks/useListings';
import './Homepage.css';

const CITIES = [
  { title: 'Sandton City Hotel', distance: '53 km away', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', accent: '#C22157' },
  { title: 'Joburg City Hotel', distance: '168 km away', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80', accent: '#A72574' },
  { title: 'Woodmead Hotel', distance: '30 miles away', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', accent: '#D9752B' },
  { title: 'Hyde Park Hotel', distance: '34 km away', image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80', accent: '#E0473F' },
];

const GETAWAY_TABS = {
  'Destinations for arts and culture': [
    { name: 'Eiffel Tower', place: 'Paris, France' },
    { name: 'Statue of Liberty', place: 'New York, USA' },
    { name: 'Shibuya Crossing', place: 'Tokyo, Japan' },
    { name: 'Big Ben', place: 'London, UK' },
    { name: 'Colosseum', place: 'Rome, Italy' },
    { name: 'Sydney Opera House', place: 'Sydney, Australia' },
    { name: 'Table Mountain', place: 'Cape Town, South Africa' },
    { name: 'Sagrada Familia', place: 'Barcelona, Spain' },
    { name: 'Great Wall', place: 'Beijing, China' },
    { name: 'Christ the Redeemer', place: 'Rio de Janeiro, Brazil' },
    { name: 'Santorini', place: 'Santorini, Greece' },
    { name: 'Grand Canyon', place: 'Arizona, USA' },
  ],
  'Destinations for outdoor adventure': [
    { name: 'Serengeti National Park', place: 'Tanzania' },
    { name: 'Torres del Paine', place: 'Chile' },
    { name: 'Banff National Park', place: 'Canada' },
    { name: 'Kruger National Park', place: 'South Africa' },
    { name: 'Milford Sound', place: 'New Zealand' },
    { name: 'Yosemite Valley', place: 'California, USA' },
  ],
  'Mountain cabins': [
    { name: 'Aspen', place: 'Colorado, USA' },
    { name: 'Queenstown', place: 'New Zealand' },
    { name: 'Drakensberg', place: 'South Africa' },
    { name: 'Zermatt', place: 'Switzerland' },
    { name: 'Banff', place: 'Canada' },
    { name: 'Chamonix', place: 'France' },
  ],
  'Beach destinations': [
    { name: 'Bora Bora', place: 'French Polynesia' },
    { name: 'Maldives', place: 'South Asia' },
    { name: 'Zanzibar', place: 'Tanzania' },
    { name: 'Cape Town Beaches', place: 'South Africa' },
    { name: 'Phuket', place: 'Thailand' },
    { name: 'Ibiza', place: 'Spain' },
  ],
  'Popular destinations': [
    { name: 'New York City', place: 'USA' },
    { name: 'Paris', place: 'France' },
    { name: 'Tokyo', place: 'Japan' },
    { name: 'Cape Town', place: 'South Africa' },
    { name: 'Bangkok', place: 'Thailand' },
    { name: 'London', place: 'UK' },
  ],
  'Unique stays': [
    { name: 'Treehouses', place: 'Worldwide' },
    { name: 'Houseboats', place: 'Worldwide' },
    { name: 'Glamping domes', place: 'Worldwide' },
    { name: 'Lighthouses', place: 'Worldwide' },
    { name: 'Converted windmills', place: 'Worldwide' },
    { name: 'Cave stays', place: 'Worldwide' },
  ],
};

const GETAWAY_TAB_NAMES = Object.keys(GETAWAY_TABS);

export default function Homepage() {
  const { listings, loading, error } = useListings({ limit: 8 });
  const [activeTab, setActiveTab] = useState(GETAWAY_TAB_NAMES[0]);

  return (
    <div className="homepage">
      <div className="homepage__toolbar">
        <div className="container homepage__search">
          <SearchBar homepage />
        </div>
      </div>

      <section className="hero">
        <img
          src="/images/hero-banner.jpg"
          alt="Modern home surrounded by trees at dusk"
          className="hero__image"
        />
        <div className="hero__content">
          <h1>Not sure where to go? Perfect.</h1>
          <Link to="/search" className="btn hero__cta">I'm flexible</Link>
        </div>
      </section>

      <section className="container homepage__section">
        <h2>Popular homes</h2>
        {loading && <p className="homepage__status">Loading stays…</p>}
        {error && <p className="homepage__status homepage__status--error">{error}</p>}
        {!loading && !error && (
          <div className="homepage__grid">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section className="container homepage__section">
        <h2>Inspiration for your next trip</h2>
        <div className="homepage__cities">
          {CITIES.map((city) => (
            <CityCard key={city.title} {...city} />
          ))}
        </div>
      </section>

      <section className="container homepage__section">
        <h2>Discover Airbnb Experiences</h2>
        <div className="homepage__experiences">
          <div
            className="homepage__experience"
            style={{ backgroundImage: 'url(/images/experience-trip.jpg)' }}
          >
            <p>Things to do on your trip</p>
            <button className="btn btn-outline">Experiences</button>
          </div>
          <div
            className="homepage__experience"
            style={{ backgroundImage: 'url(/images/experience-home.jpg)' }}
          >
            <p>Things to do from home</p>
            <button className="btn btn-outline">Online Experiences</button>
          </div>
        </div>
      </section>

      <section className="container homepage__section homepage__giftcards">
        <div className="homepage__giftcards-text">
          <h2>Shop Airbnb gift cards</h2>
          <button className="btn btn-outline">Learn more</button>
        </div>
        <div className="homepage__giftcards-fan">
          <div
            className="giftcard giftcard--1"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400&q=80)' }}
          >
            <img src="/branding/logo-icon-white.png" alt="Airbnb" className="giftcard__logo" />
          </div>
          <div className="giftcard giftcard--2">
            <img src="/branding/logo-icon-white.png" alt="Airbnb" className="giftcard__logo" />
          </div>
          <div
            className="giftcard giftcard--3"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80)' }}
          >
            <img src="/branding/logo-icon-white.png" alt="Airbnb" className="giftcard__logo" />
          </div>
        </div>
      </section>

      <section
        className="container homepage__section homepage__host-banner"
        style={{ backgroundImage: 'url(/images/host-banner.jpg)' }}
      >
        <div className="homepage__host-banner-overlay">
          <h2>Questions about hosting?</h2>
          <button className="btn btn-primary">Ask a Superhost</button>
        </div>
      </section>

      <section className="container homepage__section homepage__getaways">
        <h2>Inspiration for future getaways</h2>
        <div className="homepage__getaways-tabs">
          {GETAWAY_TAB_NAMES.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`homepage__getaways-tab ${tab === activeTab ? 'homepage__getaways-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="homepage__getaways-grid">
          {GETAWAY_TABS[activeTab].map((dest) => (
            <div key={dest.name} className="homepage__getaway">
              <p className="homepage__getaway-name">{dest.name}</p>
              <p className="homepage__getaway-place">{dest.place}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

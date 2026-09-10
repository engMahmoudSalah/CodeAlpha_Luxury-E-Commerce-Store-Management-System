import bcrypt from 'bcryptjs';
import { db, initDatabase } from '../server/config/database.js';

export const seedProducts = [
  {
    id: 1,
    name: 'AeroPulse Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear wireless headphones featuring active hybrid noise cancellation, 40-hour battery life, and crystal-clear high-fidelity sound.',
    price: 199.99,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    stock: 25,
    category: 'Audio'
  },
  {
    id: 2,
    name: 'Apex Pro Mechanical Gaming Keyboard',
    description: 'Ultra-responsive RGB mechanical keyboard with custom linear switches, aircraft-grade aluminum frame, and magnetic wrist rest.',
    price: 129.99,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    stock: 18,
    category: 'Gaming'
  },
  {
    id: 3,
    name: 'Quantum Precision Wireless Gaming Mouse',
    description: 'Ergonomic 26,000 DPI optical sensor mouse with ultra-low latency 2.4GHz wireless connection and 8 programmable buttons.',
    price: 79.99,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    stock: 30,
    category: 'Gaming'
  },
  {
    id: 4,
    name: 'Vanguard 4K Ultra-HD Monitor 27-inch',
    description: 'IPS professional creative and productivity display with 99% sRGB color gamut, HDR400, USB-C 90W power delivery, and ultra-thin bezels.',
    price: 349.99,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    stock: 12,
    category: 'Electronics'
  },
  {
    id: 5,
    name: 'Lumina Smart Ambient Desk Lamp',
    description: 'Minimalist aluminum LED desk lamp with touch dimming, adjustable color temperature (2700K-6500K), and integrated Qi wireless charging pad.',
    price: 59.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 40,
    category: 'Home & Office'
  },
  {
    id: 6,
    name: 'Horizon Fit Smartwatch Series 5',
    description: 'All-day health & fitness companion with AMOLED always-on display, heart rate & SpO2 tracking, GPS, and 7-day battery life.',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    stock: 22,
    category: 'Wearables'
  },
  {
    id: 7,
    name: 'Nomad Rugged 20,000mAh Power Bank',
    description: 'Heavy-duty portable fast charger with 65W USB-C Power Delivery, dual outputs, and aircraft-grade shock-resistant casing.',
    price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1609592426868-b80894589d14?w=800&q=80',
    stock: 50,
    category: 'Accessories'
  },
  {
    id: 8,
    name: 'StudioWave Hi-Res USB-C Microphone',
    description: 'Studio-grade cardioid condenser microphone with built-in pop filter, zero-latency headphone monitoring, and plug-and-play simplicity.',
    price: 89.99,
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    stock: 15,
    category: 'Audio'
  },
  {
    id: 9,
    name: 'ErgoComfort Memory Foam Seat Cushion',
    description: 'Orthopedic memory foam seat cushion designed for ergonomic lumbar support, posture alignment, and pressure relief during long work sessions.',
    price: 34.99,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    stock: 35,
    category: 'Home & Office'
  },
  {
    id: 10,
    name: 'SoundSphere Portable Bluetooth Speaker',
    description: '360-degree immersive audio with deep bass, IPX7 waterproof rating, 24-hour playtime, and true wireless stereo pairing.',
    price: 69.99,
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    stock: 28,
    category: 'Audio'
  },
  {
    id: 11,
    name: 'Executive Vegan Leather Laptop Sleeve 14-16"',
    description: 'Slim water-resistant carrying case with magnetic closure, soft microfiber interior lining, and dedicated accessory pocket.',
    price: 39.99,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    stock: 45,
    category: 'Accessories'
  },
  {
    id: 12,
    name: 'AeroStream High-Speed WiFi 6 Router',
    description: 'Dual-band AX3000 wireless gigabit router with beamforming technology, WPA3 security, and seamless coverage up to 2,500 sq ft.',
    price: 119.99,
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
    stock: 14,
    category: 'Electronics'
  },
  {
    id: 13,
    name: 'Titan Curved Ultrawide OLED Gaming Monitor 49-inch',
    description: 'Quantum Dot OLED 240Hz 0.03ms gaming display with 5120x1440 resolution, dual QHD immersion, and HDR True Black 400.',
    price: 899.99,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    stock: 8,
    category: 'Electronics'
  },
  {
    id: 14,
    name: 'SonicPro Studio Monitor Headphones',
    description: 'Flat-response studio reference headphones engineered for professional mixing, mastering, and critical acoustic listening.',
    price: 249.99,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    stock: 16,
    category: 'Audio'
  },
  {
    id: 15,
    name: 'PulseFit GPS Fitness Tracker Band',
    description: 'Ultra-lightweight activity tracker with built-in GPS, multi-sport analytics, continuous SpO2 monitoring, and 10-day battery capacity.',
    price: 89.99,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    stock: 32,
    category: 'Wearables'
  },
  {
    id: 16,
    name: 'PrismRGB Desktop Cable Management Station',
    description: 'Weighted magnetic cable routing organizer with subtle ambient ARGB underglow and silicone cable channels.',
    price: 29.99,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    stock: 60,
    category: 'Accessories'
  },
  {
    id: 17,
    name: 'NovaLite Portable LED Video Light',
    description: 'Full-spectrum Bi-Color LED video panel with 2500K-8500K adjustable CRI 97+ output and integrated OLED control panel.',
    price: 44.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 25,
    category: 'Photography'
  },
  {
    id: 18,
    name: 'ZenDesk Bamboo Ergonomic Riser',
    description: 'Sustainably sourced solid bamboo desk riser with dual storage drawers and cable pass-through channels.',
    price: 54.99,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    stock: 20,
    category: 'Home & Office'
  },
  {
    id: 19,
    name: 'CyberDeck Modular Mechanical Numpad',
    description: 'Hot-swappable wireless numeric keypad with programmable rotary knob and anodized aluminum chassis.',
    price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    stock: 28,
    category: 'Gaming'
  },
  {
    id: 20,
    name: 'ApexStream 4K Ultra Webcam with Dual Mics',
    description: 'Pro streaming webcam with Sony STARVIS sensor, auto-framing AI focus, HDR video encoding, and dual stereo mics.',
    price: 109.99,
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    stock: 19,
    category: 'Electronics'
  },
  {
    id: 21,
    name: 'AuraGlow Smart LED Light Strip 10m',
    description: 'Addressable RGBIC LED light strip with Music Sync, Apple HomeKit & Google Assistant integration, and fluid transitions.',
    price: 39.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 45,
    category: 'Smart Home'
  },
  {
    id: 22,
    name: 'Velocity Fast Magnetic Wireless Charger',
    description: '15W MagSafe compatible wireless charging pad with braided nylon cable and slim aircraft-grade aluminum casing.',
    price: 34.99,
    image_url: 'https://images.unsplash.com/photo-1609592426868-b80894589d14?w=800&q=80',
    stock: 55,
    category: 'Accessories'
  },
  {
    id: 23,
    name: 'HyperCool Dual-Fan Laptop Cooling Pad',
    description: 'Quiet dual 140mm fan cooling stand with adjustable tilt angles and dual USB pass-through ports.',
    price: 39.99,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    stock: 30,
    category: 'Accessories'
  },
  {
    id: 24,
    name: 'AcousticBass Active Subwoofer System',
    description: 'Compact 8-inch powered studio subwoofer delivering punchy 100W RMS low-frequency extension down to 30Hz.',
    price: 179.99,
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    stock: 12,
    category: 'Audio'
  },
  {
    id: 25,
    name: 'ProFrame Digital Canvas Photo Frame 15-inch',
    description: '1080p IPS Wi-Fi digital picture frame with matte anti-glare glass and instant smartphone photo synchronization.',
    price: 199.99,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    stock: 14,
    category: 'Smart Home'
  },
  {
    id: 26,
    name: 'OmniGrip Custom Gaming Controller Wireless',
    description: 'Pro controller with hall-effect anti-drift joysticks, remappable rear paddles, and adjustable trigger locks.',
    price: 69.99,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    stock: 26,
    category: 'Gaming'
  },
  {
    id: 27,
    name: 'CleanAir Desktop HEPA Air Purifier',
    description: 'True HEPA H13 filtration air purifier removing 99.97% of airborne dust, pollen, and odor with whisper-quiet sleep mode.',
    price: 89.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 22,
    category: 'Home & Office'
  },
  {
    id: 28,
    name: 'Vantage Mirrorless Camera Shoulder Bag',
    description: 'Weatherproof canvas camera bag with customizable padded dividers and rapid side access zipper.',
    price: 74.99,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    stock: 18,
    category: 'Photography'
  },
  {
    id: 29,
    name: 'FocusBar Ultra Monitor Screenbar Lamp',
    description: 'Asymmetric optical desktop light bar designed to eliminate screen glare and reduce eye strain.',
    price: 64.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 35,
    category: 'Home & Office'
  },
  {
    id: 30,
    name: 'ElectroPod TWS Earbuds with Wireless Charging',
    description: 'True wireless ANC earbuds with spatial audio, environmental noise reduction, and IPX5 splash resistance.',
    price: 119.99,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    stock: 40,
    category: 'Audio'
  },
  {
    id: 31,
    name: 'PowerGrid 100W GaN 4-Port Fast Desktop Charger',
    description: 'Ultra-compact Gallium Nitride charger supporting 100W USB-C Power Delivery for laptops, tablets, and phones simultaneously.',
    price: 59.99,
    image_url: 'https://images.unsplash.com/photo-1609592426868-b80894589d14?w=800&q=80',
    stock: 50,
    category: 'Accessories'
  },
  {
    id: 32,
    name: 'Matrix3D Precision Gaming Mousepad XL',
    description: 'Micro-woven cloth desk pad with anti-fray stitched edges and high-grip rubber backing.',
    price: 24.99,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    stock: 75,
    category: 'Gaming'
  },
  {
    id: 33,
    name: 'SmartSync Wi-Fi Smart Plug Trio Pack',
    description: 'Set of 3 smart plugs with energy monitoring, scheduling timer, and voice control via Alexa & Google Home.',
    price: 29.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 40,
    category: 'Smart Home'
  },
  {
    id: 34,
    name: 'Horizon Glass Smart Scales with Body Mass Telemetry',
    description: 'Bluetooth bio-impedance smart weight scale tracking body fat %, muscle mass, hydration, and BMI trends.',
    price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    stock: 28,
    category: 'Wearables'
  },
  {
    id: 35,
    name: 'TerraTouch Felt Desk Mat & Mouse Pad',
    description: 'Natural merino wool blend felt desk surface providing thermal warmth and smooth mouse tracking.',
    price: 29.99,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    stock: 35,
    category: 'Home & Office'
  },
  {
    id: 36,
    name: 'CinemaSound 5.1 Wireless Soundbar System',
    description: 'Dolby Atmos spatial soundbar with wireless rear speakers and 10-inch down-firing wireless subwoofer.',
    price: 329.99,
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    stock: 10,
    category: 'Audio'
  },
  {
    id: 37,
    name: 'VisionCam 360 Indoor Security Camera',
    description: 'Pan-and-tilt 2K smart indoor security camera with AI motion tracking, night vision, and two-way audio.',
    price: 59.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 30,
    category: 'Smart Home'
  },
  {
    id: 38,
    name: 'CarbonShield Waterproof Hard-Shell Backpack',
    description: 'Impact-resistant hardshell travel backpack with TSA combination lock and anti-theft hidden pockets.',
    price: 89.99,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    stock: 20,
    category: 'Accessories'
  },
  {
    id: 39,
    name: 'PrecisionPro Aluminum Camera Tripod',
    description: 'Lightweight travel tripod with 360-degree panoramic ball head, quick-release plate, and inverted macro setup.',
    price: 129.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 15,
    category: 'Photography'
  },
  {
    id: 40,
    name: 'FlightDeck HOTAS Flight Simulator Joystick',
    description: 'Dual-throttle and flight stick combo with 30 programmable buttons for space and aerial combat simulation.',
    price: 159.99,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    stock: 12,
    category: 'Gaming'
  },
  {
    id: 41,
    name: 'SolarPulse Emergency Solar Battery Bank 30,000mAh',
    description: 'Rugged outdoor power station with built-in solar panels, 400 lumen LED flashlight, and IP66 water resistance.',
    price: 69.99,
    image_url: 'https://images.unsplash.com/photo-1609592426868-b80894589d14?w=800&q=80',
    stock: 25,
    category: 'Accessories'
  },
  {
    id: 42,
    name: 'LuxePro Carbon Fiber Studio Headphones',
    description: 'Ultra-lightweight open-back reference studio headphones featuring custom 50mm beryllium drivers, real carbon fiber earcups, and detachable oxygen-free copper cabling.',
    price: 299.99,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    stock: 18,
    category: 'Audio'
  },
  {
    id: 43,
    name: 'CyberKey Hardware Security Token Duo',
    description: 'FIDO2 / U2F certified hardware authentication keys for encrypted multi-factor account protection.',
    price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
    stock: 50,
    category: 'Electronics'
  },
  {
    id: 44,
    name: 'StreamDock Programmable Control Pad 15-Key',
    description: '15 customizable LCD keys for triggering live scenes, launching media, and controlling studio gear instantly.',
    price: 139.99,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    stock: 22,
    category: 'Gaming'
  },
  {
    id: 45,
    name: 'ThermoSip Smart Temperature Control Travel Mug',
    description: 'App-controlled heated travel mug keeping drinks at your preferred temperature (120°F - 145°F) for up to 3 hours.',
    price: 99.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 20,
    category: 'Home & Office'
  },
  {
    id: 46,
    name: 'NanoBeams Modular Smart Wall Light Panels 9-Pack',
    description: 'Interlocking geometric RGBIC light bars creating customized dynamic wall lighting layouts.',
    price: 179.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 15,
    category: 'Smart Home'
  },
  {
    id: 47,
    name: 'AeroRing Minimalist Titanium Health Tracker Ring',
    description: 'Sleek grade-5 titanium smart ring tracking sleep stages, body temperature variations, heart rate, and recovery score.',
    price: 199.99,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    stock: 14,
    category: 'Wearables'
  },
  {
    id: 48,
    name: 'UltraDrive 2TB Rugged External NVMe SSD',
    description: 'Ultra-fast 2050MB/s USB 3.2 Gen 2x2 portable solid-state drive with IP65 dust/water protection.',
    price: 189.99,
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
    stock: 30,
    category: 'Electronics'
  },
  {
    id: 49,
    name: 'SoundBar Pro Cinematic Surround Speaker',
    description: 'High-power 2.1 acoustic channel soundbar with HDMI eARC connection and optical digital input.',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    stock: 25,
    category: 'Audio'
  },
  {
    id: 50,
    name: 'Apex Desk Mat Precision Stitch Edition',
    description: 'Water-repellent micro-weave desk pad with reinforced edge stitching and non-slip natural rubber base.',
    price: 34.99,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    stock: 40,
    category: 'Home & Office'
  }
];

export function seed() {
  console.log('--- Initializing Database and Running Seeder ---');
  initDatabase();

  const checkStmt = db.prepare('SELECT id FROM products WHERE id = ? OR name = ?');
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO products (id, name, description, price, image_url, stock, category)
    VALUES (@id, @name, @description, @price, @image_url, @stock, @category)
  `);

  const insertMany = db.transaction((products) => {
    let insertedCount = 0;
    for (const product of products) {
      const existing = checkStmt.get(product.id, product.name);
      if (!existing) {
        insertStmt.run(product);
        insertedCount++;
      }
    }
    return insertedCount;
  });

  const inserted = insertMany(seedProducts);
  const totalCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

  // Seed default Demo User if not existing
  try {
    const userCheck = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@luxestore.com');
    if (!userCheck) {
      const demoHash = bcrypt.hashSync('demo1234', 10);
      const userRes = db.prepare(`
        INSERT INTO users (name, email, password_hash, phone)
        VALUES (?, ?, ?, ?)
      `).run('Alex Morgan (Demo)', 'demo@luxestore.com', demoHash, '+1 (555) 234-5678');
      
      const demoUserId = userRes.lastInsertRowid;
      // Seed default shipping address
      try {
        db.prepare(`
          INSERT INTO addresses (user_id, label, recipient_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).run(
          demoUserId,
          'Home',
          'Alex Morgan',
          '+1 (555) 234-5678',
          '100 Market Street',
          'Suite 500',
          'San Francisco',
          'CA',
          '94105',
          'United States'
        );
      } catch (addrErr) {
        // Address table might be created during migrations
      }
    }
  } catch (err) {
    console.warn('Note on demo user seed:', err.message);
  }

  console.log(`Database Seed Result: Inserted ${inserted} new products. Total products in database: ${totalCount}`);
  return { inserted, total: totalCount };
}

// Execute directly if run via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    seed();
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed database:', err);
    process.exit(1);
  }
}

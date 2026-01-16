import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Heart, Target, Eye, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface AboutPageProps {
  onNavigate?: (page: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551327420-4b280d52cc68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBjb21tdW5pdHklMjBmZWxsb3dzaGlwfGVufDF8fHx8MTc2MzM5NzczMXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="About Us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--wine)]/80"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl lg:text-6xl mb-4">About Us</h1>
          <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-6 text-center">
            Our Story
          </h2>
          <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-8"></div>
          <div className="space-y-6 text-gray-700 font-['Merriweather'] text-lg leading-relaxed">
            <p>
              Unlimited Grace and Mercy Worldwide Mission Inc. was founded on a simple but powerful
              truth: God's grace knows no limits. Born out of a divine mandate to spread the
              transforming power of the gospel, our church has grown into a vibrant community of
              believers.
            </p>
            <p>
              We are more than a church; we are a family united by faith, bound by love, and driven
              by a passion to see lives transformed through the unlimited grace and mercy of God. Our
              journey began with a small gathering of faithful believers who dared to believe that God
              could do exceedingly abundantly above all they could ask or think (Ephesians 3:20 - 21).
            </p>
            <p>
              Today, we continue to witness God's faithfulness as He adds to our number daily those
              who are being saved. We remain committed to our founding vision: to be a beacon of hope,
              a center of transformation, and a community where everyone can experience God's unlimited
              grace and mercy.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="p-8 text-center rounded-2xl border-2 border-[var(--wine)]/10 h-full">
                <motion.div
                  className="w-20 h-20 bg-[var(--wine)] rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Target className="w-10 h-10 text-[var(--gold)]" />
                </motion.div>
                <h3 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-4">Our Mission</h3>
                <p className="text-gray-600 font-['Merriweather']">
                  To spread the gospel of Jesus Christ, making disciples who will experience and share
                  God's unlimited grace and mercy with the world.
                </p>
              </Card>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="p-8 text-center rounded-2xl border-2 border-[var(--wine)]/10 h-full">
                <motion.div
                  className="w-20 h-20 bg-[var(--wine)] rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Eye className="w-10 h-10 text-[var(--gold)]" />
                </motion.div>
                <h3 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-4">Our Vision</h3>
                <p className="text-gray-600 font-['Merriweather']">
                  To build a global community of Spirit-filled believers who are empowered to transform
                  their world through the unlimited grace of God.
                </p>
              </Card>
            </motion.div>

            {/* Values */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="p-8 text-center rounded-2xl border-2 border-[var(--wine)]/10 h-full">
                <motion.div
                  className="w-20 h-20 bg-[var(--wine)] rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Heart className="w-10 h-10 text-[var(--gold)]" />
                </motion.div>
                <h3 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-4">Our Values</h3>
                <p className="text-gray-600 font-['Merriweather']">
                  Grace, Love, Excellence, Integrity, Community, and Service to God and humanity guide
                  everything we do.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leadership - Temporarily hidden until content is complete */}
      {/* 
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Our Leadership
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden rounded-2xl hover:shadow-xl transition-shadow h-full">
                <img
                  src="https://images.unsplash.com/photo-1748518146559-a596d5b3a016?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcGFzdG9yJTIwbGVhZGVyfGVufDF8fHx8MTc2MzM5NzczMHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="General Overseer"
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-1">
                    Rev. Dr. [Name]
                  </h3>
                  <p className="text-[var(--gold)] font-['Montserrat'] mb-3">General Overseer</p>
                  <p className="text-gray-600 font-['Merriweather'] text-sm">
                    Leading the church with wisdom, grace, and a heart for souls.
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden rounded-2xl hover:shadow-xl transition-shadow h-full">
                <img
                  src="https://images.unsplash.com/photo-1748518146559-a596d5b3a016?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcGFzdG9yJTIwbGVhZGVyfGVufDF8fHx8MTc2MzM5NzczMHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Assistant Pastor"
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-1">
                    Pastor [Name]
                  </h3>
                  <p className="text-[var(--gold)] font-['Montserrat'] mb-3">Assistant Pastor</p>
                  <p className="text-gray-600 font-['Merriweather'] text-sm">
                    Supporting the vision with dedication and pastoral care.
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden rounded-2xl hover:shadow-xl transition-shadow h-full">
                <img
                  src="https://images.unsplash.com/photo-1748518146559-a596d5b3a016?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcGFzdG9yJTIwbGVhZGVyfGVufDF8fHx8MTc2MzM5NzczMHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Church Administrator"
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-1">[Name]</h3>
                  <p className="text-[var(--gold)] font-['Montserrat'] mb-3">Church Administrator</p>
                  <p className="text-gray-600 font-['Merriweather'] text-sm">
                    Managing operations with excellence and integrity.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      */}

      {/* What We Believe */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              What We Believe
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 rounded-2xl">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">The Bible</h3>
              <p className="text-gray-600 font-['Merriweather']">
                We believe the Bible is the inspired and infallible Word of God, our final authority
                for faith and life.
              </p>
            </Card>

            <Card className="p-6 rounded-2xl">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">The Trinity</h3>
              <p className="text-gray-600 font-['Merriweather']">
                We believe in one God, eternally existing in three persons: Father, Son, and Holy
                Spirit.
              </p>
            </Card>

            <Card className="p-6 rounded-2xl">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">Salvation</h3>
              <p className="text-gray-600 font-['Merriweather']">
                We believe salvation is by grace through faith in Jesus Christ alone, not by works.
              </p>
            </Card>

            <Card className="p-6 rounded-2xl">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">The Church</h3>
              <p className="text-gray-600 font-['Merriweather']">
                We believe in the universal Church, the body of Christ, and the local church as God's
                plan for fellowship and growth.
              </p>
              <p className="text-gray-600 font-['Merriweather'] mt-3">
                It is the responsibility of all members to live for JESUS CHRIST and win souls for His kingdom.
              </p>
            </Card>

            <Card className="p-6 rounded-2xl">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">
                Christ's Return
              </h3>
              <p className="text-gray-600 font-['Merriweather']">
                We believe in the personal, visible, and glorious return of Jesus Christ.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[var(--wine)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Montserrat'] text-3xl md:text-4xl mb-6">Join Our Family</h2>
          <p className="text-white/90 font-['Merriweather'] text-lg mb-8 max-w-2xl mx-auto">
            Experience the unlimited grace and mercy of God in a community that feels like home.
          </p>
          <Button
            onClick={() => onNavigate && onNavigate('service-times')}
            className="bg-[var(--gold)] text-[var(--wine-dark)] hover:bg-[var(--gold-light)] font-['Montserrat'] text-lg px-8 py-6"
          >
            Visit Us This Sunday
          </Button>
        </div>
      </section>
    </div>
  );
}
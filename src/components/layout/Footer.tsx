// ============================================
// Footer Component
// Simple footer with links and copyright
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import doctorGoLogo from '@/assets/doctorgo-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={doctorGoLogo} alt="DoctorGo" className="h-8 w-auto mix-blend-multiply dark:mix-blend-screen dark:invert" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted healthcare companion. Find doctors, book appointments, and manage your health journey with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/doctors" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Get Recommendations
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Patient Login
                </Link>
              </li>
            </ul>
          </div>

          {/* For Doctors */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">For Healthcare Providers</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auth?role=doctor" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Doctor Login
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Join Our Network</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Partner With Us</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                support@doctorgo.com
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                1-800-DOCTOR
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                123 Health Ave, Medical City
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DoctorGo. All rights reserved. Built for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

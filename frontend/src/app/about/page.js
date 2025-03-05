'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Globe, 
  Lightbulb, 
  ArrowRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/NavBar';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Alex Rodriguez",
      role: "Founder & CEO",
      bio: "Serial entrepreneur with a passion for transforming the rental experience.",
      avatar: "/avatars/alex.jpg"
    },
    {
      name: "Sarah Kim",
      role: "Chief Technology Officer",
      bio: "Tech innovator driving our platform's cutting-edge solutions.",
      avatar: "/avatars/sarah.jpg"
    }
  ];

  const companyMilestones = [
    { 
      icon: Rocket, 
      title: "Founded", 
      description: "Launched with a mission to simplify rental experiences" 
    },
    { 
      icon: Globe, 
      title: "First 1000 Users", 
      description: "Reached major user milestone in just 6 months" 
    },
    { 
      icon: Lightbulb, 
      title: "Innovation Award", 
      description: "Recognized for transformative technology in real estate" 
    }
  ];

  return (
    <div>
      
      <Navbar />
      
    <div className="container mx-auto px-4 py-12 space-y-12">
    <BackgroundBeamsWithCollision />

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-primary">
          About Our Rental Marketplace
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We're reimagining how people find, list, and manage rental properties 
          with technology that simplifies every step of the journey.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid md:grid-cols-2 gap-8 items-center"
      >
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Our Mission</h2>
          <p className="text-muted-foreground">
            To create a seamless, transparent, and user-friendly rental 
            experience that empowers both property owners and renters 
            through innovative technology and thoughtful design.
          </p>
          <div className="flex space-x-2">
            <Badge variant="secondary">Technology</Badge>
            <Badge variant="secondary">Innovation</Badge>
            <Badge variant="secondary">User Experience</Badge>
          </div>
        </div>
        <div className="relative">
          <Image 
            src="/mission-illustration.svg" 
            alt="Our Mission" 
            width={500} 
            height={400} 
            className="w-full h-auto"
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-6"
      >
        <h2 className="text-3xl font-semibold text-center">
          Our Leadership Team
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-secondary/10 rounded-lg p-8 text-center"
      >
        <h2 className="text-3xl font-semibold mb-6">Our Journey</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {companyMilestones.map((milestone, index) => {
            const Icon = milestone.icon;
            return (
              <div 
                key={index} 
                className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4 flex justify-center text-primary">
                  <Icon size={48} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                <p className="text-muted-foreground">{milestone.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-semibold">Ready to Join Us?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Whether you're a property owner looking to list, or a renter searching 
          for your perfect space, we're here to make your journey smooth and enjoyable.
        </p>
        <div className="flex justify-center space-x-4">
          <Button>
            List a Property <ArrowRight className="ml-2" />
          </Button>
          <Button variant="outline">
            Find a Rental <ArrowRight className="ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
    </div>
  );
}
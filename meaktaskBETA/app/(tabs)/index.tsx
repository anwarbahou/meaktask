import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

// Define types for component props
interface ServiceCategoryProps {
  icon: string;
  title: string;
  onPress: () => void;
}

interface TaskerCardProps {
  image?: string;
  name: string;
  rating: string;
  category: string;
  location: string;
  price: string;
}

interface PromoCardProps {
  title: string;
  subtitle: string;
  color: string;
  image?: string;
}

// Service category component
const ServiceCategory = ({ icon, title, onPress }: ServiceCategoryProps) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
    <View style={styles.categoryIconContainer}>
      <Ionicons name={icon as any} size={32} color="#1a5d4c" />
    </View>
    <Text style={styles.categoryTitle}>{title}</Text>
  </TouchableOpacity>
);

// Tasker card component
const TaskerCard = ({ image, name, rating, category, location, price }: TaskerCardProps) => (
  <TouchableOpacity style={styles.taskerCard}>
    <View style={styles.taskerHeader}>
      <Ionicons name="person-circle-outline" size={28} color="#1a5d4c" />
      <Text style={styles.taskerName}>{name}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    </View>
    <View style={styles.taskerDetails}>
      <Text style={styles.categoryText}>{category}</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.locationText}>{location}</Text>
      </View>
      <Text style={styles.priceText}>{price}</Text>
    </View>
  </TouchableOpacity>
);

// Promo card component
const PromoCard = ({ title, subtitle, color, image }: PromoCardProps) => (
  <TouchableOpacity 
    style={[styles.promoCard, { backgroundColor: color }]}
  >
    <View style={styles.promoContent}>
      <Text style={styles.promoTitle}>{title}</Text>
      <Text style={styles.promoSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [userRole, setUserRole] = useState('client'); // 'client' or 'tasker'

  const toggleUserRole = () => {
    setUserRole(userRole === 'client' ? 'tasker' : 'client');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with logo and role switcher */}
      <View style={styles.header}>
        <Text style={styles.logo}>MeakTask</Text>
        <TouchableOpacity 
          style={styles.roleSwitcher}
          onPress={toggleUserRole}
        >
          <Text style={styles.roleText}>
            I'm a {userRole === 'client' ? 'Client' : 'Tasker'}
          </Text>
          <Ionicons name="swap-horizontal" size={20} color="#1a5d4c" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Categories Section */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            <ServiceCategory 
              icon="construct-outline" 
              title="Handyman" 
              onPress={() => {}} 
            />
            <ServiceCategory 
              icon="home-outline" 
              title="Cleaning" 
              onPress={() => {}} 
            />
            <ServiceCategory 
              icon="car-outline" 
              title="Moving" 
              onPress={() => {}} 
            />
            <ServiceCategory 
              icon="brush-outline" 
              title="Painting" 
              onPress={() => {}} 
            />
          </ScrollView>
        </View>
        
        {/* Recommended Taskers Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📣 Recommended Taskers near you</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.taskersScrollContent}
          >
            <TaskerCard 
              name="John Smith"
              rating="4.8"
              category="Handyman"
              location="2.5 miles away"
              price="$25-45/hr"
            />
            <TaskerCard 
              name="Sarah Johnson"
              rating="4.9"
              category="Cleaning"
              location="3.1 miles away"
              price="$20-35/hr"
            />
            <TaskerCard 
              name="Mike Williams"
              rating="4.7"
              category="Moving"
              location="1.8 miles away"
              price="$30-50/hr"
            />
          </ScrollView>
        </View>
        
        {/* Trending Services Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🔥 Trending Services</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.taskersScrollContent}
          >
            <TaskerCard 
              name="Home Cleaning"
              rating="4.9"
              category="Most booked"
              location="15+ taskers available"
              price="From $60"
            />
            <TaskerCard 
              name="Furniture Assembly"
              rating="4.8"
              category="Popular"
              location="10+ taskers available"
              price="From $45"
            />
            <TaskerCard 
              name="Yard Work"
              rating="4.7"
              category="Seasonal"
              location="8+ taskers available"
              price="From $40"
            />
          </ScrollView>
        </View>
        
        {/* Promo Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🎁 Promo codes</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoScrollContent}
          >
            <PromoCard 
              title="10% OFF"
              subtitle="Your first task"
              color="#5de8c3"
            />
            <PromoCard 
              title="FREE DELIVERY"
              subtitle="Use code: MEAKFREE"
              color="#3b8a7a"
            />
          </ScrollView>
        </View>
        
        {/* Get More with MeakTask Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Get More with MeakTask</Text>
          <View style={styles.infoCardsContainer}>
            <TouchableOpacity style={styles.infoCard}>
              <Ionicons name="person-add-outline" size={28} color="#1a5d4c" />
              <Text style={styles.infoCardTitle}>Why become a Tasker?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={28} color="#1a5d4c" />
              <Text style={styles.infoCardTitle}>How MeakTask Works</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoCard}>
              <Ionicons name="grid-outline" size={28} color="#1a5d4c" />
              <Text style={styles.infoCardTitle}>Explore Task Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoCard}>
              <Ionicons name="location-outline" size={28} color="#1a5d4c" />
              <Text style={styles.infoCardTitle}>Hire Local, Fast</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Extra padding at bottom for scroll */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a5d4c',
  },
  roleSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a5d4c',
    marginRight: 6,
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    marginBottom: 10,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 24,
    width: 80,
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e8f5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  sectionContainer: {
    paddingVertical: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
    color: '#333',
  },
  taskersScrollContent: {
    paddingHorizontal: 16,
  },
  taskerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: width * 0.7,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taskerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#555',
  },
  taskerDetails: {
    gap: 6,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a5d4c',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  promoScrollContent: {
    paddingHorizontal: 16,
  },
  promoCard: {
    width: width * 0.6,
    height: 100,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    justifyContent: 'center',
  },
  promoContent: {
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: 'white',
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomPadding: {
    height: 70,
  },
});

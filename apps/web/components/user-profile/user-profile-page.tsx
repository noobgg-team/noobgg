"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { ProfileHeader } from './profile-header';
import { ProfileNavigation } from './profile-navigation';
import { AboutTab } from './tabs/about-tab';
import { ProfessionalTab } from './tabs/professional-tab';
import { GamerExperienceTab } from './tabs/gamer-experience-tab';
import { TimelineTab } from './tabs/timeline-tab';
import { FriendsTab } from './tabs/friends-tab';
import { PhotosTab } from './tabs/photos-tab';
import { ReviewsTab } from './tabs/reviews-tab';
import type { 
  UserProfile, 
  ProfileStats, 
  SocialLink, 
  ProfileTabType,
  Post,
  Friend,
  Group,
  Photo,
  GamerExperience,
  ConnectedPlatform,
  FavoriteGame,
  PCHardware,
  GameReview,
  Badge,
  Quest
} from '@/types/user-profile';
import Image from 'next/image';

interface UserProfilePageProps {
  profile: UserProfile;
  stats: ProfileStats;
  socialLinks: SocialLink[];
  posts: Post[];
  friends: Friend[];
  groups: Group[];
  photos: Photo[];
  // Gaming specific props
  gamerExperiences: GamerExperience[];
  connectedPlatforms: ConnectedPlatform[];
  favoriteGames: FavoriteGame[];
  pcHardware: PCHardware[];
  gameReviews: GameReview[];
  // Sidebar props
  credits?: number;
  badges?: Badge[];
  quests?: Quest[];
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  locale?: string;
}

// Media tab combines photos and videos
function MediaTab({ photos, isOwnProfile }: { photos: Photo[], isOwnProfile: boolean }) {
  return (
    <PhotosTab 
      photos={photos}
      isOwnProfile={isOwnProfile}
      onViewAll={() => {
        console.log('View all media');
      }}
      onPhotoClick={(photo) => {
        console.log('Photo clicked:', photo);
      }}
    />
  );
}

export function UserProfilePage({
  profile,
  stats,
  socialLinks,
  posts,
  friends,
  groups,
  photos,
  gamerExperiences,
  connectedPlatforms,
  favoriteGames,
  pcHardware,
  gameReviews,
  credits,
  badges,
  quests,
  isOwnProfile = false,
  isFollowing = false,
  onFollow,
  onMessage,
  locale,
}: UserProfilePageProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabType>('about');

  const handleTabChange = (tab: ProfileTabType) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutTab profile={profile} />;
      
      case 'professional':
        return (
          <ProfessionalTab 
            profile={profile}
            gamerExperiences={gamerExperiences}
            connectedPlatforms={connectedPlatforms}
          />
        );
      
      case 'gamer-experience':
        return (
          <GamerExperienceTab 
            profile={profile}
            favoriteGames={favoriteGames}
            pcHardware={pcHardware}
          />
        );
      
      case 'timeline':
        return (
          <TimelineTab 
            posts={posts}
            onLoadMore={() => {
              console.log('Load more posts');
            }}
            hasMore={false}
            isLoading={false}
          />
        );
      
      case 'media':
        return <MediaTab photos={photos} isOwnProfile={isOwnProfile} />;
      
      case 'friends':
        return (
          <FriendsTab 
            friends={friends}
            isOwnProfile={isOwnProfile}
            onViewAll={() => {
              console.log('View all friends');
            }}
            onMessage={(friendId) => {
              console.log('Message friend:', friendId);
            }}
            onRemoveFriend={(friendId) => {
              console.log('Remove friend:', friendId);
            }}
          />
        );
      
      case 'reviews':
        return (
          <ReviewsTab 
            reviews={gameReviews}
            onLoadMore={() => {
              console.log('Load more reviews');
            }}
            hasMore={false}
            isLoading={false}
          />
        );
      
      default:
        return <AboutTab profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <Navbar />
      
      {/* Main Content Area with Sidebar Layout */}
      <div className="flex">
        {/* Left Sidebar - Navigation */}
        <ProfileNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Profile Header */}
          <div className="p-6 border-b">
            <ProfileHeader
              profile={profile}
              stats={stats}
              socialLinks={socialLinks}
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              onFollow={onFollow}
              onMessage={onMessage}
              locale={locale}
            />
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 px-12">
            <div className="max-w-6xl mx-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Credits, Badges, Quests */}
        <div className="w-80 bg-card border-l p-6 space-y-6">
          {/* Credits */}
          <div className="bg-background rounded-lg p-4 border">
            <h3 className="font-semibold text-lg mb-3 text-right">Credits</h3>
            <div className="text-right space-y-2">
              <div className="text-2xl font-bold text-primary">
                {credits !== undefined && credits !== null ? credits.toLocaleString() : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Available Credits</div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-background rounded-lg p-4 border">
            <h3 className="font-semibold text-lg mb-3 text-right">Badges</h3>
            <div className="grid grid-cols-3 gap-2">
              {!badges || badges.length === 0 ? (
                <div className="col-span-3 text-center text-sm text-muted-foreground py-4">
                  No badges earned yet
                </div>
              ) : (
                badges.slice(0, 6).map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      badge.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      badge.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      badge.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}
                    title={`${badge.name}: ${badge.description}`}
                  >
                    {badge.iconUrl ? (
                      <Image 
                        src={badge.iconUrl} 
                        alt={badge.name}
                        height={32}
                        width={32}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {badge.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quests */}
          <div className="bg-background rounded-lg p-4 border">
            <h3 className="font-semibold text-lg mb-3 text-right">Quests</h3>
            <div className="space-y-3">
              {!quests || quests.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No active quests
                </div>
              ) : (
                quests.slice(0, 5).map((quest) => (
                  <div key={quest.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{quest.title}</span>
                      {quest.status === 'in_progress' && (
                        <div className="text-xs text-muted-foreground">
                          {quest.progress}/{quest.maxProgress}
                        </div>
                      )}
                    </div>
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        quest.status === 'completed' ? 'bg-green-500' :
                        quest.status === 'in_progress' ? 'bg-yellow-500' :
                        'bg-gray-300'
                      }`}
                      title={`Quest ${quest.status.replace('_', ' ')}`}
                    >
                      {quest.status === 'completed' && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                      {quest.status === 'in_progress' && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Learn More Section */}
          <div className="bg-background rounded-lg p-4 border">
            <h3 className="font-semibold text-lg mb-3 text-right">Learn More</h3>
            <div className="text-sm text-muted-foreground text-right space-y-2">
              <div>Blizzard is offline.</div>
              <div>Learn more about</div>
              <div>them on their channel!</div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-background rounded-lg p-4 border">
            <h3 className="font-semibold text-lg mb-3 text-right">Photos</h3>
            <div className="grid grid-cols-2 gap-2">
              {photos.slice(0, 4).map((photo) => (
                <Image
                  key={photo.id}
                  src={photo.url}
                  width={100}
                  height={80}
                  alt={photo.caption || 'Photo'}
                  className="w-full h-20 object-cover rounded"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
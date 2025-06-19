import { Trophy } from 'lucide-react';
import { Achievement } from '@/services/achievementService';

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Dinding Prestasi
          </h2>
          <p className="text-xl text-muted-foreground font-[var(--font-inter)]">
            Pencapaian membanggakan yang telah diraih sekolah kami
          </p>
        </div>

        {achievements.length > 0 ? (
          <div className="relative">
            {/* Garis vertikal di tengah timeline */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-border hidden md:block"></div>

            {achievements.map((achievement, index) => (
              <div
                key={achievement._id}
                className={`relative flex items-center mb-12 w-full md:w-auto ${
                  index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'
                }`}
              >
                <div className="w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}">
                  <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border">
                    <div className="flex items-center mb-3">
                      <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                      <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded font-[var(--font-inter)]">
                        {achievement.level}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-card-foreground mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-muted-foreground mb-2 font-[var(--font-inter)]">Diraih oleh: {achievement.achievedBy}</p>
                    <p className="text-primary font-semibold">{achievement.year}</p>
                  </div>
                </div>

                {/* Titik di tengah timeline */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-card shadow-lg hidden md:block"></div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Belum ada data prestasi yang bisa ditampilkan.</p>
        )}
      </div>
    </section>
  );
}
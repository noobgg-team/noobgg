# noob.gg
<p align="center">
  <img src="docs/noobgg-logo.png" alt="noob.gg logo" height="120" />
</p>

Bu proje, bir Hono.js backend API ve bir Next.js 15 frontend uygulamasından oluşmaktadır. Geliştirme ortamını başlatmak ve proje üzerinde çalışmak için aşağıdaki talimatları izleyin.

## Başlarken

Bu proje bir monorepo yapısındadır ve [Turborepo](https://turbo.build/repo) kullanılarak yönetilmektedir. Paket yöneticisi olarak [Bun](https://bun.sh/) kullanılmaktadır.

**Gereksinimler:**

*   Node.js (önerilen sürüm için ana `package.json` dosyasındaki `engines` bölümüne bakın)
*   Bun ([Kurulum Talimatları](https://bun.sh/docs/installation))
*   Docker (PostgreSQL veritabanı için gerekli)

### PostgreSQL Docker Konteyner Kurulum Adımları

Bu dokümanda, PostgreSQL veritabanını Docker konteyner olarak nasıl kuracağımızı adım adım açıklayacağız.

#### 1. PostgreSQL Docker İmajının İndirilmesi

İlk adım olarak PostgreSQL'in Alpine Linux tabanlı hafif versiyonunu indiriyoruz:

```bash
docker pull postgres:16.9-alpine3.22
```

Bu komut, Docker Hub'dan PostgreSQL'in 16.9 versiyonunu Alpine Linux 3.22 tabanlı imajını indirir. Alpine Linux tabanlı imajlar, boyut olarak daha küçük ve daha güvenlidir.

#### 2. PostgreSQL Konteynerinin Oluşturulması ve Çalıştırılması

İndirilen imajı kullanarak yeni bir konteyner oluşturup çalıştırmak için aşağıdaki komutu kullanıyoruz:

```bash
docker run -p 1453:5432 --name noobgg-postgres -e POSTGRES_PASSWORD=123noobgg123++ -d postgres:16.9-alpine3.22
```

##### Komut Parametrelerinin Açıklaması:

- `-p 1453:5432`: Port yönlendirmesi. Host makinedeki 1453 portunu, konteynerin içindeki PostgreSQL'in varsayılan portu olan 5432'ye yönlendirir.
- `--name noobgg-postgres`: Konteynere verilen isim. Bu isim ile konteyneri daha sonra kolayca yönetebiliriz.
- `-e POSTGRES_PASSWORD=123noobgg123++`: PostgreSQL root kullanıcısının (postgres) şifresini belirler.
- `-d`: Konteyneri arka planda (detached mode) çalıştırır.
- `postgres:16.9-alpine3.22`: Kullanılacak Docker imajının adı ve versiyonu.

#### Bağlantı Bilgileri

PostgreSQL veritabanına bağlanmak için aşağıdaki bilgileri kullanabilirsiniz:

- Host: localhost
- Port: 1453
- Kullanıcı Adı: postgres
- Şifre: 123noobgg123++
- Varsayılan Veritabanı: postgres

#### Önemli Docker Komutları

Konteyner yönetimi için kullanabileceğiniz bazı faydalı komutlar:

```bash
docker ps                # Çalışan konteynerleri listeler
docker stop noobgg-postgres   # Konteyneri durdurur
docker start noobgg-postgres  # Konteyneri başlatır
docker logs noobgg-postgres   # Konteyner loglarını gösterir
```

**Kurulum:**

1.  Proje dosyalarını klonlayın:
    ```bash
    git clone https://github.com/altudev/noobgg.git
    cd noob.gg
    ```
2.  Gerekli bağımlılıkları yükleyin:
    ```bash
    bun install
    ```

**Geliştirme Sunucularını Başlatma:**

Geliştirme sunucularını (backend ve frontend) aynı anda başlatmak için aşağıdaki komutu çalıştırın:

```bash
turbo dev
```

Bu komut:
*   Backend API'sini `http://localhost:3000` adresinde başlatır.
*   Frontend Next.js uygulamasını `http://localhost:3001` adresinde başlatır.

## Proje Yapısı

Proje aşağıdaki gibi bir klasör yapısına sahiptir:

*   `apps/`: Uygulama kodlarını içerir.
    *   `api/`: Hono.js tabanlı backend API.
    *   `web/`: Next.js tabanlı frontend uygulaması.
*   `packages/`: Paylaşılan paketleri ve kütüphaneleri içerir (örneğin, UI bileşenleri, paylaşılan TypeScript yapılandırmaları, ESLint kuralları vb.).
*   `package.json`: Ana proje bağımlılıklarını ve `turbo` komutlarını tanımlar.
*   `turbo.json`: Turborepo yapılandırma dosyası.

## Kullanılan Teknolojiler

### Backend (API)

*   **Framework**: [Hono.js](https://hono.dev/) - Hızlı ve hafif bir web framework'ü.
*   **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - TypeScript tabanlı modern bir SQL query builder.
*   **Veritabanı**: PostgreSQL 16 (Drizzle ORM ile entegre).
*   **Diğer Kütüphaneler**:
    *   `@aws-sdk/client-s3`: AWS S3 ile etkileşim için (eğer kullanılıyorsa).
    *   `dotenv`: Ortam değişkenlerini yönetmek için.

### Frontend (Web)

*   **Framework**: [Next.js 15](https://nextjs.org/) - React tabanlı, sunucu tarafı renderlama (SSR) ve statik site oluşturma (SSG) yeteneklerine sahip bir framework.
*   **UI Kütüphanesi**: [React](https://react.dev/)
*   **Stil**: [Tailwind CSS](https://tailwindcss.com/) (muhtemelen `apps/web/tailwind.config.js` veya benzeri bir dosyada yapılandırılmıştır).

### Geliştirme Araçları

*   **Monorepo Yönetimi**: [Turborepo](https://turbo.build/repo)
*   **Paket Yöneticisi**: [Bun](https://bun.sh/)
*   **TypeScript**: Statik tipleme için.
*   **ESLint**: Kod kalitesini ve tutarlılığını sağlamak için.

## Katkıda Bulunma

Katkılarınız için teşekkür ederiz! Lütfen katkıda bulunma rehberini (eğer varsa) inceleyin veya bir issue açarak ya da pull request göndererek projeye destek olun.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## Katkıda Bulunanlar

Yayınlarımıza katılan ve geliştirme sürecimizde bize destek olan tüm arkadaşlarımıza çok teşekkür ederiz! 🙏

<a href="https://github.com/altudev"><img width="60px" alt="altudev" src="https://github.com/altudev.png"/></a>
<a href="https://github.com/furkanczay"><img width="60px" alt="Furkan Özay" src="https://github.com/furkanczay.png"/></a>
<a href="https://github.com/HikmetMelikk"><img width="60px" alt="Hikmet Melik" src="https://github.com/HikmetMelikk.png"/></a>
<a href="https://github.com/gurgenufuk12"><img width="60px" alt="Ufuk Gürgen" src="https://github.com/gurgenufuk12.png"/></a>
<a href="https://github.com/apps/google-labs-jules"><img width="60px" alt="Jules (Google Labs AI)" src="https://avatars.githubusercontent.com/in/842251?s=41&u=e6ce41f2678ba45349e003a9b1d8719b7f414a6f&v=4"/></a>
<a href="https://github.com/apps/devin-ai-integration"><img width="60px" alt="DevinAI Integration" src="https://avatars.githubusercontent.com/in/811515?s=41&u=22ae8177548c8cd6cccb497ac571937d080c80bc&v=4"/></a>

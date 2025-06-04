# 🎮 noob.gg

<p align="center">
  <img src="docs/noobgg-logo.png" alt="noob.gg logo" height="120" />
  <br/>
  <em>Modern Oyun Platformu</em>
</p>

<div align="center">

[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0.0-000000?style=flat&logo=bun)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js)](https://nextjs.org)
[![Hono](https://img.shields.io/badge/Hono.js-3.0-000000?style=flat&logo=hono)](https://hono.dev)

</div>

## 📝 Genel Bakış

Bu proje, bir Hono.js backend API ve bir Next.js 15 frontend uygulamasından oluşmaktadır. Geliştirme ortamını başlatmak ve proje üzerinde çalışmak için aşağıdaki talimatları izleyin.

## 🚀 Başlarken

Bu proje bir monorepo yapısındadır ve [Turborepo](https://turbo.build/repo) kullanılarak yönetilmektedir. Paket yöneticisi olarak [Bun](https://bun.sh/) kullanılmaktadır.

### 📋 Gereksinimler

* Node.js (önerilen sürüm için ana `package.json` dosyasındaki `engines` bölümüne bakın)
* Bun ([Kurulum Talimatları](https://bun.sh/docs/installation))
* Docker (PostgreSQL veritabanı için gerekli)

### 🐳 PostgreSQL Docker Konteyner Kurulum Adımları

Bu dokümanda, PostgreSQL veritabanını Docker konteyner olarak nasıl kuracağımızı adım adım açıklayacağız.

#### 1️⃣ PostgreSQL Docker İmajının İndirilmesi

İlk adım olarak PostgreSQL'in Alpine Linux tabanlı hafif versiyonunu indiriyoruz:

```bash
docker pull postgres:16.9-alpine3.22
```

> 💡 **Not:** Bu komut, Docker Hub'dan PostgreSQL'in 16.9 versiyonunu Alpine Linux 3.22 tabanlı imajını indirir. Alpine Linux tabanlı imajlar, boyut olarak daha küçük ve daha güvenlidir.

#### 2️⃣ PostgreSQL Konteynerinin Oluşturulması ve Çalıştırılması

İndirilen imajı kullanarak yeni bir konteyner oluşturup çalıştırmak için aşağıdaki komutu kullanıyoruz:

```bash
docker run -p 1453:5432 --name noobgg-postgres -e POSTGRES_PASSWORD=123noobgg123++ -d postgres:16.9-alpine3.22
```

##### 🔍 Komut Parametrelerinin Açıklaması:

| Parametre | Açıklama |
|-----------|----------|
| `-p 1453:5432` | Port yönlendirmesi. Host makinedeki 1453 portunu, konteynerin içindeki PostgreSQL'in varsayılan portu olan 5432'ye yönlendirir. |
| `--name noobgg-postgres` | Konteynere verilen isim. Bu isim ile konteyneri daha sonra kolayca yönetebiliriz. |
| `-e POSTGRES_PASSWORD=123noobgg123++` | PostgreSQL root kullanıcısının (postgres) şifresini belirler. |
| `-d` | Konteyneri arka planda (detached mode) çalıştırır. |
| `postgres:16.9-alpine3.22` | Kullanılacak Docker imajının adı ve versiyonu. |

#### 🔌 Bağlantı Bilgileri

PostgreSQL veritabanına bağlanmak için aşağıdaki bilgileri kullanabilirsiniz:

| Parametre | Değer |
|-----------|-------|
| Host | `localhost` |
| Port | `1453` |
| Kullanıcı Adı | `postgres` |
| Şifre | `123noobgg123++` |
| Varsayılan Veritabanı | `postgres` |

#### ⚡ Önemli Docker Komutları

Konteyner yönetimi için kullanabileceğiniz bazı faydalı komutlar:

```bash
# Çalışan konteynerleri listeler
docker ps

# Konteyneri durdurur
docker stop noobgg-postgres

# Konteyneri başlatır
docker start noobgg-postgres

# Konteyner loglarını gösterir
docker logs noobgg-postgres
```

### 💻 Kurulum

1. Proje dosyalarını klonlayın:
   ```bash
   git clone https://github.com/altudev/noobgg.git
   cd noob.gg
   ```

2. Gerekli bağımlılıkları yükleyin:
   ```bash
   bun install
   ```

### 🏃‍♂️ Geliştirme Sunucularını Başlatma

Geliştirme sunucularını (backend ve frontend) aynı anda başlatmak için aşağıdaki komutu çalıştırın:

```bash
turbo dev
```

Bu komut:
* Backend API'sini `http://localhost:3000` adresinde başlatır
* Frontend Next.js uygulamasını `http://localhost:3001` adresinde başlatır

## 📁 Proje Yapısı

```
noob.gg/
├── apps/                    # Uygulama kodları
│   ├── api/                # Hono.js backend API
│   └── web/                # Next.js frontend uygulaması
├── packages/               # Paylaşılan paketler ve kütüphaneler
│   ├── ui/                # UI bileşenleri
│   ├── tsconfig/          # TypeScript yapılandırmaları
│   └── eslint-config/     # ESLint kuralları
├── package.json           # Ana proje bağımlılıkları
└── turbo.json            # Turborepo yapılandırması
```

## 🛠️ Kullanılan Teknolojiler

### 🔙 Backend (API)

| Teknoloji | Açıklama |
|-----------|----------|
| [Hono.js](https://hono.dev/) | Hızlı ve hafif bir web framework'ü |
| [Drizzle ORM](https://orm.drizzle.team/) | TypeScript tabanlı modern bir SQL query builder |
| PostgreSQL 16 | Veritabanı (Drizzle ORM ile entegre) |
| AWS SDK | S3 etkileşimleri için |
| dotenv | Ortam değişkenleri yönetimi |

### 🔜 Frontend (Web)

| Teknoloji | Açıklama |
|-----------|----------|
| [Next.js 15](https://nextjs.org/) | SSR/SSG yeteneklerine sahip React framework'ü |
| [React](https://react.dev/) | UI Kütüphanesi |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework'ü |

### 🛠️ Geliştirme Araçları

| Araç | Amaç |
|------|------|
| [Turborepo](https://turbo.build/repo) | Monorepo yönetimi |
| [Bun](https://bun.sh/) | Paket yöneticisi |
| TypeScript | Statik tipleme |
| ESLint | Kod kalitesi ve tutarlılığı |

## 🤝 Katkıda Bulunma

Katkılarınız için teşekkür ederiz! Lütfen katkıda bulunma rehberini (eğer varsa) inceleyin veya projeye destek olmak için:
* Bir issue açın
* Pull request gönderin

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## 👥 Katkıda Bulunanlar

Yayınlarımıza katılan ve geliştirme sürecimizde bize destek olan tüm arkadaşlarımıza çok teşekkür ederiz! 🙏

<div align="center">

<a href="https://github.com/altudev"><img width="60px" alt="altudev" src="https://github.com/altudev.png" title="altudev"/></a>
<a href="https://github.com/furkanczay"><img width="60px" alt="Furkan Özay" src="https://github.com/furkanczay.png" title="Furkan Özay"/></a>
<a href="https://github.com/HikmetMelikk"><img width="60px" alt="Hikmet Melik" src="https://github.com/HikmetMelikk.png" title="Hikmet Melik"/></a>
<a href="https://github.com/gurgenufuk12"><img width="60px" alt="Ufuk Gürgen" src="https://github.com/gurgenufuk12.png" title="Ufuk Gürgen"/></a>
<a href="https://github.com/apps/google-labs-jules"><img width="60px" alt="Jules (Google Labs AI)" src="https://avatars.githubusercontent.com/in/842251?s=41&u=e6ce41f2678ba45349e003a9b1d8719b7f414a6f&v=4" title="Jules (Google Labs AI)"/></a>
<a href="https://github.com/apps/devin-ai-integration"><img width="60px" alt="DevinAI Integration" src="https://avatars.githubusercontent.com/in/811515?s=41&u=22ae8177548c8cd6cccb497ac571937d080c80bc&v=4" title="DevinAI Integration"/></a>

</div>

---
<div align="center">
noob.gg ekibi tarafından ❤️ ile yapıldı
</div>

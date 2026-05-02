import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from './data-source';
import { RoleOrmEntity } from './typeorm/entities/role.orm-entity';
import { UserOrmEntity } from './typeorm/entities/user.orm-entity';
import { UserInfoOrmEntity } from './typeorm/entities/user-info.orm-entity';
import { CategoryOrmEntity } from './typeorm/entities/category.orm-entity';
import { TagOrmEntity } from './typeorm/entities/tag.orm-entity';
import { NewsOrmEntity } from './typeorm/entities/news.orm-entity';
import { CommentOrmEntity } from './typeorm/entities/comment.orm-entity';
import { LikeOrmEntity } from './typeorm/entities/like.orm-entity';
import { NotificationOrmEntity } from './typeorm/entities/notification.orm-entity';
import { UserNotificationOrmEntity } from './typeorm/entities/user-notification.orm-entity';
import { NewsApprovalOrmEntity } from './typeorm/entities/news-approval.orm-entity';
import { UserRole } from '../../core/shared/enums/user-role.enum';
import { NewsStatus } from '../../core/shared/enums/news-status.enum';
import { ApprovalStatus } from '../../core/shared/enums/approval-status.enum';

const SEED_ASSETS_DIR = 'seed-assets';
const BASE_IMAGES_DIR = 'uploads';

function copySeedAssets() {
  const subDirs = ['avatars', 'news'];
  for (const sub of subDirs) {
    const src = path.join(SEED_ASSETS_DIR, sub);
    const dest = path.join(BASE_IMAGES_DIR, sub);
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      fs.copyFileSync(path.join(src, file), path.join(dest, file));
    }
  }
  console.log('Seed assets скопированы в uploads/');
}

async function cleanDb(manager: import('typeorm').EntityManager) {
  console.log('Очистка базы данных...');
  await manager.query(`
    TRUNCATE TABLE
      user_notifications,
      notifications,
      news_approval,
      likes,
      comments,
      news_tags,
      news,
      user_roles,
      user_subscriptions,
      users_info,
      users,
      tags,
      news_categories,
      roles
    RESTART IDENTITY CASCADE
  `);
  console.log('База данных очищена');
}

async function seed() {
  const isFresh = process.argv.includes('--fresh');

  copySeedAssets();

  await AppDataSource.initialize();
  console.log('Подключение к БД установлено');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    if (isFresh) {
      await cleanDb(queryRunner.manager);
    }
    await seedData(queryRunner.manager);
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }

  await AppDataSource.destroy();
  console.log('');
  console.log('✓ База данных успешно заполнена тестовыми данными');
  console.log('');
  console.log('Тестовые пользователи (пароль для всех: Password123!):');
  console.log('  admin            — системный администратор (DevOps)');
  console.log('  editor_volkova   — технический редактор');
  console.log('  editor_morozov   — редактор корпоративных новостей');
  console.log('  sokolova_dev     — Senior Frontend Developer');
  console.log('  nikitin_dev      — Backend Developer');
  console.log('  lebedeva_qa      — QA Engineer');
  console.log('  orlov_devops     — DevOps Engineer');
}

async function seedData(manager: import('typeorm').EntityManager) {
  const roleRepo = manager.getRepository(RoleOrmEntity);
  const userRepo = manager.getRepository(UserOrmEntity);
  const userInfoRepo = manager.getRepository(UserInfoOrmEntity);
  const categoryRepo = manager.getRepository(CategoryOrmEntity);
  const tagRepo = manager.getRepository(TagOrmEntity);
  const newsRepo = manager.getRepository(NewsOrmEntity);
  const commentRepo = manager.getRepository(CommentOrmEntity);
  const likeRepo = manager.getRepository(LikeOrmEntity);
  const notificationRepo = manager.getRepository(NotificationOrmEntity);
  const userNotificationRepo = manager.getRepository(UserNotificationOrmEntity);
  const approvalRepo = manager.getRepository(NewsApprovalOrmEntity);

  // --- Роли ---
  console.log('Создание ролей...');
  let roleAdmin = await roleRepo.findOne({ where: { name: UserRole.ADMIN } });
  if (!roleAdmin) {
    roleAdmin = roleRepo.create({ name: UserRole.ADMIN });
    await roleRepo.save(roleAdmin);
  }

  let roleEditor = await roleRepo.findOne({ where: { name: UserRole.EDITOR } });
  if (!roleEditor) {
    roleEditor = roleRepo.create({ name: UserRole.EDITOR });
    await roleRepo.save(roleEditor);
  }

  let roleUser = await roleRepo.findOne({ where: { name: UserRole.USER } });
  if (!roleUser) {
    roleUser = roleRepo.create({ name: UserRole.USER });
    await roleRepo.save(roleUser);
  }

  // --- Пользователи ---
  console.log('Создание пользователей...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const usersData = [
    {
      username: 'admin',
      email: 'admin@techcorp.ru',
      lastName: 'Захаров',
      firstName: 'Артём',
      surname: 'Николаевич',
      position: 'Системный администратор портала',
      department: 'DevOps',
      avatarUrl: `${BASE_IMAGES_DIR}/avatars/zakharov.jpg`,
      roles: [roleAdmin],
    },
    {
      username: 'editor_volkova',
      email: 'volkova@techcorp.ru',
      lastName: 'Волкова',
      firstName: 'Анна',
      surname: 'Сергеевна',
      position: 'Технический редактор',
      department: 'Отдел технического контента',
      avatarUrl: `${BASE_IMAGES_DIR}/avatars/volkova.jpg`,
      roles: [roleEditor],
    },
    {
      username: 'editor_morozov',
      email: 'morozov@techcorp.ru',
      lastName: 'Морозов',
      firstName: 'Кирилл',
      surname: 'Андреевич',
      position: 'Редактор корпоративных новостей',
      department: 'Отдел технического контента',
      avatarUrl: `${BASE_IMAGES_DIR}/avatars/morozov.jpg`,
      roles: [roleEditor],
    },
    {
      username: 'sokolova_dev',
      email: 'sokolova@techcorp.ru',
      lastName: 'Соколова',
      firstName: 'Ольга',
      surname: 'Игоревна',
      position: 'Senior Frontend Developer',
      department: 'Отдел разработки',
      avatarUrl: `${BASE_IMAGES_DIR}/avatars/sokolova.jpg`,
      roles: [roleUser],
    },
    {
      username: 'nikitin_dev',
      email: 'nikitin@techcorp.ru',
      lastName: 'Никитин',
      firstName: 'Павел',
      surname: 'Владимирович',
      position: 'Backend Developer',
      department: 'Отдел разработки',
      avatarUrl: `${BASE_IMAGES_DIR}/avatars/nikitin.jpg`,
      roles: [roleUser],
    },
    {
      username: 'lebedeva_qa',
      email: 'lebedeva@techcorp.ru',
      lastName: 'Лебедева',
      firstName: 'Наталья',
      surname: 'Александровна',
      position: 'QA Engineer',
      department: 'Отдел тестирования',
      avatarUrl: `${BASE_IMAGES_DIR}/avatars/lebedeva.jpg`,
      roles: [roleUser],
    },
    {
      username: 'orlov_devops',
      email: 'orlov@techcorp.ru',
      lastName: 'Орлов',
      firstName: 'Денис',
      surname: 'Романович',
      position: 'DevOps Engineer',
      department: 'DevOps',
      avatarUrl: `${BASE_IMAGES_DIR}/avatars/orlov.jpg`,
      roles: [roleUser],
    },
  ];

  const savedUsers: UserOrmEntity[] = [];

  for (const data of usersData) {
    let user = await userRepo.findOne({ where: { username: data.username } });
    if (!user) {
      user = userRepo.create({
        username: data.username,
        email: data.email,
        passwordHash,
        isApproved: true,
        roles: data.roles,
      });
      await userRepo.save(user);

      const userInfo = userInfoRepo.create({
        userId: user.id,
        lastName: data.lastName,
        firstName: data.firstName,
        surname: data.surname,
        position: data.position,
        department: data.department,
        avatarUrl: data.avatarUrl,
      });
      await userInfoRepo.save(userInfo);
    } else {
      const userInfo = await userInfoRepo.findOne({ where: { userId: user.id } });
      if (userInfo && userInfo.avatarUrl !== data.avatarUrl) {
        userInfo.avatarUrl = data.avatarUrl;
        await userInfoRepo.save(userInfo);
      }
    }
    savedUsers.push(user);
  }

  const [adminUser, editor1, editor2, user1, user2, user3, user4] = savedUsers;

  // --- Категории ---
  console.log('Создание категорий...');
  const categoriesData = [
    'Разработка',
    'DevOps и инфраструктура',
    'Безопасность',
    'Жизнь компании',
    'Продукты и релизы',
    'Технологии и тренды',
    'Обучение и развитие',
  ];

  const savedCategories: CategoryOrmEntity[] = [];
  for (const name of categoriesData) {
    let category = await categoryRepo.findOne({ where: { name } });
    if (!category) {
      category = categoryRepo.create({ name });
      await categoryRepo.save(category);
    }
    savedCategories.push(category);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [catDev, catDevOps, catSecurity, catLife, catProducts, catTrends, catEducation] =
    savedCategories;

  // --- Теги ---
  console.log('Создание тегов...');
  const tagsData = [
    'TypeScript',
    'NestJS',
    'PostgreSQL',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'code review',
    'рефакторинг',
    'релиз',
    'митап',
    'хакатон',
    'найм',
  ];

  const savedTags: TagOrmEntity[] = [];
  for (const name of tagsData) {
    let tag = await tagRepo.findOne({ where: { name } });
    if (!tag) {
      tag = tagRepo.create({ name });
      await tagRepo.save(tag);
    }
    savedTags.push(tag);
  }

  const [
    tagTS,
    tagNest,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tagPG,
    tagDocker,
    tagK8s,
    tagCICD,
    tagReview,
    tagRefactor,
    tagRelease,
    tagMeetup,
    tagHackathon,
    tagHiring,
  ] = savedTags;

  // --- Новости ---
  console.log('Создание новостей...');
  const newsData = [
    {
      title: 'Переход на NestJS завершён: итоги миграции бэкенда',
      content: `Команда бэкенд-разработки завершила плановую миграцию основного сервиса с Express на NestJS. Работы заняли три спринта и прошли без деградации продакшена.\n\nВ ходе миграции были внедрены модульная архитектура, декораторы валидации через class-validator, а также улучшена типизация всего API-слоя. Покрытие юнит-тестами выросло с 42% до 78%.\n\nPavел Никитин, руководивший миграцией: «Новая архитектура существенно упрощает онбординг — новый разработчик может разобраться в структуре проекта за день, а не за неделю». Следующий шаг — переход на микросервисы для модуля нотификаций.`,
      author: editor1,
      category: catDev,
      status: NewsStatus.published,
      publishedAt: new Date('2026-03-05T10:00:00'),
      image: `${BASE_IMAGES_DIR}/news/nestjs-migration.jpg`,
      tags: [tagNest, tagTS, tagRefactor],
    },
    {
      title: 'Kubernetes-кластер переведён на новую версию: что изменилось',
      content: `DevOps-команда выполнила плановое обновление Kubernetes-кластера с версии 1.28 до 1.32. Обновление затронуло все окружения: dev, staging и production.\n\nКлючевые изменения: улучшена стабильность планировщика при высокой нагрузке, обновлены политики сетевой безопасности, добавлена поддержка Sidecar Containers как stable-фичи. Время деплоя новых версий сервисов сократилось на 20%.\n\nДенис Орлов: «Обновление прошло по регламенту, без инцидентов. Рекомендую всем командам проверить совместимость своих Helm-чартов с новыми API — часть deprecated-ресурсов была удалена».`,
      author: editor2,
      category: catDevOps,
      status: NewsStatus.published,
      publishedAt: new Date('2026-03-08T09:30:00'),
      image: `${BASE_IMAGES_DIR}/news/kubernetes-update.jpg`,
      tags: [tagK8s, tagDocker, tagCICD],
    },
    {
      title: 'Выпущена версия 2.5 корпоративного портала — обзор новых возможностей',
      content: `Отдел разработки выпустил версию 2.5 внутреннего новостного портала. Релиз содержит 12 новых функций и закрывает 34 задачи из бэклога.\n\nГлавные нововведения: система подписок на категории с email-уведомлениями, улучшенный редактор новостей с поддержкой Markdown, пагинация и фильтрация в ленте, а также экспорт новостей в PDF.\n\nКоманда frontend во главе с Ольгой Соколовой полностью переработала интерфейс на компонентной архитектуре. Производительность страниц выросла по метрике LCP на 40%. Следующий релиз (2.6) запланирован на апрель.`,
      author: editor1,
      category: catProducts,
      status: NewsStatus.pending_review,
      publishedAt: null,
      image: `${BASE_IMAGES_DIR}/news/portal-release.jpg`,
      tags: [tagRelease, tagTS],
    },
    {
      title: 'Аудит безопасности: найденные уязвимости и план устранения',
      content: `В феврале компания провела внешний аудит безопасности инфраструктуры. Аудиторы из команды ИБ проверили 14 сервисов, API-шлюз и конфигурацию CI/CD-пайплайнов.\n\nВыявлено 3 уязвимости уровня Medium и 1 уровня Low. Критических проблем не обнаружено. Уязвимости связаны с устаревшими зависимостями в двух сервисах и избыточными правами сервисных аккаунтов в Kubernetes.\n\nВсе уязвимости уровня Medium запланированы к устранению до 1 апреля. Для разработчиков будет проведён воркшоп по безопасной разработке — дата будет объявлена дополнительно.`,
      author: editor2,
      category: catSecurity,
      status: NewsStatus.published,
      publishedAt: new Date('2026-03-13T14:00:00'),
      image: `${BASE_IMAGES_DIR}/news/security-audit.jpg`,
      tags: [tagK8s, tagCICD],
    },
    {
      title: 'Внутренний хакатон «TechSprint 2026»: регистрация открыта',
      content: `Компания объявляет о проведении ежегодного внутреннего хакатона «TechSprint 2026». Мероприятие пройдёт 4–5 апреля в офисе компании.\n\nУчастники смогут сформировать команды от 2 до 5 человек и реализовать проект на любом стеке технологий. Темы в этом году: инструменты для повышения продуктивности разработчиков, внутренние платформенные решения и AI-ассистенты для рабочих процессов.\n\nПризовой фонд составляет 500 000 рублей. Лучшие проекты будут рассмотрены для внедрения в продакшен. Регистрация команд открыта до 28 марта через корпоративный портал.`,
      author: editor1,
      category: catLife,
      status: NewsStatus.pending_review,
      publishedAt: null,
      image: `${BASE_IMAGES_DIR}/news/techsprint-hackathon.jpg`,
      tags: [tagHackathon, tagMeetup],
    },
    {
      title: 'Гайдлайн по code review: новые стандарты для команд',
      content: `Технический комитет утвердил обновлённый гайдлайн по проведению code review. Документ вступает в силу с 1 апреля 2026 года и обязателен для всех команд разработки.\n\nОсновные изменения: максимальный размер PR ограничен 400 строками изменений, время ответа на review — не более 24 рабочих часов, обязательное покрытие тестами для новой бизнес-логики не менее 80%. Введены автоматические проверки через GitHub Actions на линтинг и типы.\n\nДокумент доступен в корпоративной Wiki. На следующей неделе состоится встреча тимлидов для обсуждения переходного периода.`,
      author: editor2,
      category: catDev,
      status: NewsStatus.pending_review,
      publishedAt: null,
      image: `${BASE_IMAGES_DIR}/news/code-review-guidelines.jpg`,
      tags: [tagReview, tagCICD, tagTS],
    },
    {
      title: 'Открыты вакансии: ищем Senior Backend и DevOps инженеров',
      content: `HR-отдел совместно с техническими командами открыл новые вакансии. Компания активно расширяется и приглашает опытных специалистов.\n\nОткрытые позиции: Senior Backend Developer (стек: NestJS, PostgreSQL, Redis), DevOps Engineer (Kubernetes, Terraform, GitLab CI). Обе позиции предполагают возможность гибридного формата работы.\n\nЕсли у вас есть знакомые специалисты — направляйте их резюме на careers@techcorp.ru или через реферальную программу в HR-системе. За успешный реферал предусмотрено вознаграждение.`,
      author: editor1,
      category: catLife,
      status: NewsStatus.draft,
      publishedAt: null,
      image: `${BASE_IMAGES_DIR}/news/vacancies.jpg`,
      tags: [tagHiring, tagNest, tagK8s],
    },
  ];

  const savedNews: NewsOrmEntity[] = [];
  for (const data of newsData) {
    const existing = await newsRepo.findOne({ where: { title: data.title } });
    if (!existing) {
      const news = newsRepo.create({
        title: data.title,
        content: data.content,
        author: data.author,
        category: data.category,
        status: data.status,
        publishedAt: data.publishedAt ?? undefined,
        image: data.image,
        tags: data.tags,
      });
      await newsRepo.save(news);
      savedNews.push(news);
    } else {
      if (existing.image !== data.image) {
        existing.image = data.image;
        await newsRepo.save(existing);
      }
      savedNews.push(existing);
    }
  }

  // --- Комментарии ---
  console.log('Создание комментариев...');
  const commentsData = [
    {
      news: savedNews[0],
      author: user1,
      content: 'Отличная работа команды! Подскажите, планируется ли переход на монорепо с Nx?',
    },
    {
      news: savedNews[0],
      author: user2,
      content:
        'Участвовал в миграции — действительно стало намного чище. class-validator сильно упростил жизнь.',
    },
    {
      news: savedNews[1],
      author: user4,
      content: 'Проверил свои чарты — всё совместимо. Спасибо за заблаговременное предупреждение.',
    },
    {
      news: savedNews[1],
      author: user1,
      content: 'А rolling update во время обновления кластера проходил без даунтайма?',
    },
    {
      news: savedNews[2],
      author: user3,
      content: 'Наконец-то пагинация! Очень ждала этого в ленте.',
    },
    {
      news: savedNews[4],
      author: user2,
      content:
        'Уже зарегистрировал команду. Тема AI-ассистентов очень актуальна — есть много идей.',
    },
    {
      news: savedNews[4],
      author: user3,
      content: 'Будут ли онлайн-участники или только офлайн формат?',
    },
    {
      news: savedNews[6],
      author: user1,
      content: 'Отправила резюме знакомого DevOps-инженера через реферальную программу.',
    },
  ];

  for (const data of commentsData) {
    const comment = commentRepo.create(data);
    await commentRepo.save(comment);
  }

  // --- Лайки ---
  console.log('Создание лайков...');
  const likePairs = [
    { news: savedNews[0], user: user1 },
    { news: savedNews[0], user: user2 },
    { news: savedNews[0], user: user3 },
    { news: savedNews[1], user: user4 },
    { news: savedNews[1], user: user2 },
    { news: savedNews[2], user: user1 },
    { news: savedNews[2], user: user3 },
    { news: savedNews[4], user: user1 },
    { news: savedNews[4], user: user2 },
    { news: savedNews[4], user: user3 },
    { news: savedNews[4], user: user4 },
    { news: savedNews[6], user: user2 },
  ];

  for (const data of likePairs) {
    const existing = await likeRepo.findOne({
      where: { newsId: data.news.id, userId: data.user.id },
    });
    if (!existing) {
      const like = likeRepo.create({ newsId: data.news.id, userId: data.user.id });
      await likeRepo.save(like);
    }
  }

  // --- Согласования новостей ---
  console.log('Создание записей согласования...');
  const approvalsData = [
    {
      news: savedNews[0],
      editor: adminUser,
      status: ApprovalStatus.approved,
      comment: 'Технически точно, хорошо структурировано. Одобрено к публикации.',
    },
    {
      news: savedNews[1],
      editor: adminUser,
      status: ApprovalStatus.approved,
      comment: 'Актуальная информация, проверена с DevOps-командой.',
    },
    {
      news: savedNews[3],
      editor: adminUser,
      status: ApprovalStatus.approved,
      comment: 'Согласовано с ИБ-отделом. Чувствительные детали скрыты.',
    },
    {
      news: savedNews[5],
      editor: editor1,
      status: ApprovalStatus.pending,
      comment: undefined,
    },
    {
      news: savedNews[2],
      editor: editor2,
      status: ApprovalStatus.pending,
      comment: undefined,
    },
    {
      news: savedNews[4],
      editor: editor1,
      status: ApprovalStatus.pending,
      comment: undefined,
    },
    {
      news: savedNews[6],
      editor: editor2,
      status: ApprovalStatus.rejected,
      comment: 'Необходимо уточнить требования к кандидатам и добавить ссылку на HR-портал.',
    },
  ];

  for (const data of approvalsData) {
    const existing = await approvalRepo.findOne({
      where: { news: { id: data.news.id }, status: data.status },
    });
    if (!existing) {
      const approval = approvalRepo.create(data);
      await approvalRepo.save(approval);
    }
  }

  // --- Уведомления ---
  console.log('Создание уведомлений...');
  const notificationsData = [
    {
      news: savedNews[0],
      message:
        'Новая статья в категории «Разработка»: «Переход на NestJS завершён: итоги миграции бэкенда»',
    },
    {
      news: savedNews[2],
      message:
        'Новая статья в категории «Продукты и релизы»: «Выпущена версия 2.5 корпоративного портала»',
    },
    {
      news: savedNews[4],
      message:
        'Новая статья в категории «Жизнь компании»: «Внутренний хакатон «TechSprint 2026»: регистрация открыта»',
    },
    {
      news: savedNews[6],
      message:
        'Новая статья в категории «Жизнь компании»: «Открыты вакансии: ищем Senior Backend и DevOps инженеров»',
    },
  ];

  const savedNotifications: NotificationOrmEntity[] = [];
  for (const data of notificationsData) {
    const notification = notificationRepo.create(data);
    await notificationRepo.save(notification);
    savedNotifications.push(notification);
  }

  // --- Пользовательские уведомления ---
  console.log('Создание пользовательских уведомлений...');
  const userNotificationsData = [
    { user: user1, notification: savedNotifications[0], isRead: true },
    { user: user1, notification: savedNotifications[1], isRead: true },
    { user: user1, notification: savedNotifications[2], isRead: false },
    { user: user2, notification: savedNotifications[0], isRead: true },
    { user: user2, notification: savedNotifications[2], isRead: false },
    { user: user2, notification: savedNotifications[3], isRead: false },
    { user: user3, notification: savedNotifications[1], isRead: false },
    { user: user3, notification: savedNotifications[2], isRead: false },
    { user: user4, notification: savedNotifications[1], isRead: true },
    { user: user4, notification: savedNotifications[3], isRead: false },
  ];

  for (const data of userNotificationsData) {
    const userNotification = userNotificationRepo.create(data);
    await userNotificationRepo.save(userNotification);
  }
}

seed().catch((err) => {
  console.error('Ошибка при заполнении БД:', err);
  process.exit(1);
});

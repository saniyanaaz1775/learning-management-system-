import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subjects = [
    {
      title: 'Python',
      slug: 'python',
      description: 'Learn Python from the ground up. Variables, types, control flow, and first steps. Build a strong foundation in syntax and best practices.',
      isPublished: true,
      sections: {
        create: [
          {
            title: 'Getting Started',
            orderIndex: 0,
            videos: {
              create: [
                { title: 'Introduction to Python', description: 'Why Python and how to get started.', youtubeVideoId: 'zOjov-2OZ0E', orderIndex: 0 },
                { title: 'Python Basics', description: 'Variables, types, and first steps in Python.', youtubeVideoId: 'kqtD5dpn9C8', orderIndex: 1 },
              ],
            },
          },
          {
            title: 'Intermediate Topics',
            orderIndex: 1,
            videos: {
              create: [
                { title: 'Object-Oriented Programming', description: 'Classes, objects, and OOP principles in Python.', youtubeVideoId: 'SiBw7os-_zI', orderIndex: 0 },
                { title: 'Data Structures', description: 'Lists, dicts, and when to use them.', youtubeVideoId: 'RBSGKlAvoiM', orderIndex: 1 },
              ],
            },
          },
        ],
      },
    },
    {
      title: 'Java',
      slug: 'java',
      description: 'Core Java programming: syntax, object-oriented design, and the JVM. Build a strong foundation for enterprise and Android development.',
      isPublished: true,
      sections: {
        create: [
          {
            title: 'Java Fundamentals',
            orderIndex: 0,
            videos: {
              create: [
                { title: 'Introduction to Java', description: 'Overview of Java and the JVM.', youtubeVideoId: 'eIrMbAQSU34', orderIndex: 0 },
                { title: 'Java Basics', description: 'Variables, types, and control flow in Java.', youtubeVideoId: 'GoXwIVyNvX0', orderIndex: 1 },
              ],
            },
          },
          {
            title: 'Object-Oriented Java',
            orderIndex: 1,
            videos: {
              create: [
                { title: 'Classes and Objects', description: 'Defining classes, constructors, and methods.', youtubeVideoId: 'SiBw7os-_zI', orderIndex: 0 },
                { title: 'Inheritance and Polymorphism', description: 'OOP principles in Java.', youtubeVideoId: 'RBSGKlAvoiM', orderIndex: 1 },
              ],
            },
          },
        ],
      },
    },
    {
      title: 'SQL',
      slug: 'sql',
      description: 'Database queries with SQL. Select, filter, aggregate, and combine data. Joins, subqueries, and best practices.',
      isPublished: true,
      sections: {
        create: [
          {
            title: 'Databases & SQL',
            orderIndex: 0,
            videos: {
              create: [
                { title: 'SQL Introduction', description: 'Select, filter, and aggregate data with SQL.', youtubeVideoId: 'HXV3zeQKqGY', orderIndex: 0 },
                { title: 'Joins and Subqueries', description: 'Combine tables and write advanced queries.', youtubeVideoId: '2Hc4_KhGw4s', orderIndex: 1 },
              ],
            },
          },
        ],
      },
    },
    {
      title: 'C++',
      slug: 'c-plus-plus',
      description: 'C++ fundamentals: syntax, memory, and object-oriented design. Build a strong foundation for systems and performance-critical code.',
      isPublished: true,
      sections: {
        create: [
          {
            title: 'C++ Basics',
            orderIndex: 0,
            videos: {
              create: [
                { title: 'Introduction to C++', description: 'Overview of C++ and when to use it.', youtubeVideoId: 'ZzaPdXTrSb8', orderIndex: 0 },
                { title: 'Variables and Types', description: 'Primitives, pointers, and references.', youtubeVideoId: 'Rub-JsjMhWY', orderIndex: 1 },
              ],
            },
          },
          {
            title: 'Intermediate C++',
            orderIndex: 1,
            videos: {
              create: [
                { title: 'Classes and OOP', description: 'Classes, objects, and inheritance in C++.', youtubeVideoId: 'SiBw7os-_zI', orderIndex: 0 },
                { title: 'STL and Data Structures', description: 'Containers and algorithms in the standard library.', youtubeVideoId: 'RBSGKlAvoiM', orderIndex: 1 },
              ],
            },
          },
        ],
      },
    },
    {
      title: 'HTML',
      slug: 'html',
      description: 'HTML and CSS for the web. Structure and style pages, layout, and responsive design.',
      isPublished: true,
      sections: {
        create: [
          {
            title: 'Markup & Styling',
            orderIndex: 0,
            videos: {
              create: [
                { title: 'HTML & CSS Basics', description: 'Structure and style web pages.', youtubeVideoId: 'PlxWf493en4', orderIndex: 0 },
                { title: 'Layout and Responsive Design', description: 'Flexbox, grid, and mobile-friendly layouts.', youtubeVideoId: 'RBSGKlAvoiM', orderIndex: 1 },
              ],
            },
          },
        ],
      },
    },
    {
      title: 'JavaScript',
      slug: 'javascript',
      description: 'JavaScript for the web. Fundamentals, the DOM, and modern JS. Build interactive front-ends and Node.js backends.',
      isPublished: true,
      sections: {
        create: [
          {
            title: 'Getting Started',
            orderIndex: 0,
            videos: {
              create: [
                { title: 'JavaScript Fundamentals', description: 'Introduction to JavaScript and the web.', youtubeVideoId: 'W6NZfCO5SIk', orderIndex: 0 },
                { title: 'Variables and Functions', description: 'Syntax, scope, and first programs.', youtubeVideoId: 'kqtD5dpn9C8', orderIndex: 1 },
              ],
            },
          },
          {
            title: 'DOM and Interactivity',
            orderIndex: 1,
            videos: {
              create: [
                { title: 'The DOM', description: 'Selecting and updating page elements.', youtubeVideoId: 'PlxWf493en4', orderIndex: 0 },
                { title: 'Events and Async', description: 'Event handlers and asynchronous JavaScript.', youtubeVideoId: 'SiBw7os-_zI', orderIndex: 1 },
              ],
            },
          },
        ],
      },
    },
    {
      title: 'Shell Scripting',
      slug: 'shell-scripting',
      description: 'Automate tasks with bash and the command line. Scripts, pipes, and system administration basics.',
      isPublished: true,
      sections: {
        create: [
          {
            title: 'Command Line & Scripts',
            orderIndex: 0,
            videos: {
              create: [
                { title: 'Shell Scripting', description: 'Automate tasks with bash and command line.', youtubeVideoId: 'lBBGqL1-XnM', orderIndex: 0 },
              ],
            },
          },
        ],
      },
    },
  ];

  for (const subject of subjects) {
    const existing = await prisma.subject.findUnique({ where: { slug: subject.slug } });
    if (existing) {
      console.log(`Subject "${subject.title}" already exists, skipping.`);
      continue;
    }
    await prisma.subject.create({
      data: {
        title: subject.title,
        slug: subject.slug,
        description: subject.description,
        isPublished: subject.isPublished,
        sections: subject.sections,
      },
    });
    console.log(`Created subject: ${subject.title}`);
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

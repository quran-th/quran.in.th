/**
 * Semantic Release Configuration for Quran-TH
 *
 * This configuration handles automated versioning, changelog generation,
 * and GitHub releases for the Quran-TH Nuxt application.
 */

const config = {
  // Git branches to release from
  branches: [
    'main',
    {
      name: 'beta',
      prerelease: true
    }
  ],

  // Plugins for release workflow
  plugins: [
    // Analyze commits to determine release type
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'revert', release: 'patch' },
          { type: 'docs', release: false },
          { type: 'style', release: false },
          { type: 'chore', release: false },
          { type: 'refactor', release: 'patch' },
          { type: 'test', release: false },
          { type: 'build', release: false },
          { type: 'ci', release: false },
          { breaking: true, release: 'major' }
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES']
        }
      }
    ],

    // Generate release notes
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: '🎉 Features' },
            { type: 'fix', section: '🐛 Bug Fixes' },
            { type: 'perf', section: '⚡ Performance Improvements' },
            { type: 'revert', section: '⏪ Reverts' },
            { type: 'refactor', section: '♻️ Code Refactoring' },
            { type: 'security', section: '🔒 Security' }
          ]
        }
      }
    ],

    // Update CHANGELOG.md
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: '# Changelog\n\nAll notable changes to the Quran-TH project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).'
      }
    ],

    // Update package.json version
    '@semantic-release/npm',

    // Create GitHub release
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path: '.output/**',
            label: 'Build Output (${nextRelease.gitTag})'
          },
          {
            path: 'dist/**',
            label: 'Distribution Files (${nextRelease.gitTag})'
          },
          {
            path: 'CHANGELOG.md',
            label: 'Changelog'
          }
        ],
        successComment: false,
        failComment: false,
        releasedLabels: ['released'],
        addReleases: 'bottom'
      }
    ],

    // Commit back changes to git
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package.json',
          'package-lock.json'
        ],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ],

  // Prepare step configuration
  prepare: [
    '@semantic-release/changelog',
    '@semantic-release/npm',
    '@semantic-release/git'
  ],

  // Publish step configuration
  publish: [
    '@semantic-release/npm',
    '@semantic-release/github'
  ],

  // Success step - run after successful release
  success: [
    '@semantic-release/github'
  ],

  // Fail step - run after failed release
  fail: [
    '@semantic-release/github'
  ]
};

module.exports = config;
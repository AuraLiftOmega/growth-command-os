/**
 * ClickUp Workspace Management Edge Function
 * Handles workspace setup, spaces, folders, lists, and tasks for AURAOMEGA Empire
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

interface ClickUpRequest {
  action: string;
  data?: Record<string, unknown>;
}

async function clickupFetch(endpoint: string, options: RequestInit = {}) {
  const apiToken = Deno.env.get('CLICKUP_API_TOKEN');
  
  if (!apiToken) {
    throw new Error('CLICKUP_API_TOKEN not configured');
  }

  const response = await fetch(`${CLICKUP_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': apiToken,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ClickUp API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Get authorized teams/workspaces
async function getWorkspaces() {
  return await clickupFetch('/team');
}

// Get spaces in a workspace
async function getSpaces(teamId: string) {
  return await clickupFetch(`/team/${teamId}/space?archived=false`);
}

// Create a new space
async function createSpace(teamId: string, name: string) {
  return await clickupFetch(`/team/${teamId}/space`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      multiple_assignees: true,
      features: {
        due_dates: { enabled: true, start_date: true, remap_due_dates: true, remap_closed_due_date: false },
        time_tracking: { enabled: true },
        tags: { enabled: true },
        time_estimates: { enabled: true },
        checklists: { enabled: true },
        custom_fields: { enabled: true },
        remap_dependencies: { enabled: true },
        dependency_warning: { enabled: true },
        portfolios: { enabled: true },
      },
    }),
  });
}

// Update space name
async function updateSpace(spaceId: string, name: string) {
  return await clickupFetch(`/space/${spaceId}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
}

// Get folders in a space
async function getFolders(spaceId: string) {
  return await clickupFetch(`/space/${spaceId}/folder?archived=false`);
}

// Create a folder
async function createFolder(spaceId: string, name: string) {
  return await clickupFetch(`/space/${spaceId}/folder`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

// Get lists in a folder
async function getLists(folderId: string) {
  return await clickupFetch(`/folder/${folderId}/list?archived=false`);
}

// Get folderless lists in a space
async function getFolderlessLists(spaceId: string) {
  return await clickupFetch(`/space/${spaceId}/list?archived=false`);
}

// Create a list
async function createList(folderId: string, name: string) {
  return await clickupFetch(`/folder/${folderId}/list`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

// Create a folderless list in a space
async function createFolderlessList(spaceId: string, name: string) {
  return await clickupFetch(`/space/${spaceId}/list`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

// Get tasks in a list
async function getTasks(listId: string) {
  return await clickupFetch(`/list/${listId}/task?archived=false`);
}

// Create a task
async function createTask(listId: string, task: {
  name: string;
  description?: string;
  priority?: number;
  due_date?: number;
  status?: string;
}) {
  return await clickupFetch(`/list/${listId}/task`, {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

// Setup AURAOMEGA Empire workspace structure
async function setupAuraOmegaWorkspace() {
  const results: Record<string, unknown> = {};
  
  // Get workspaces
  const { teams } = await getWorkspaces();
  if (!teams || teams.length === 0) {
    throw new Error('No ClickUp workspaces found');
  }
  
  const workspace = teams[0];
  results.workspace = {
    id: workspace.id,
    name: workspace.name,
    members: workspace.members?.length || 0,
  };

  // Get existing spaces
  const { spaces } = await getSpaces(workspace.id);
  results.existingSpaces = spaces.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }));

  // Find or create AuraOmega space
  let auraOmegaSpace = spaces.find((s: { name: string }) => 
    s.name.toLowerCase().includes('auraomega') || s.name.toLowerCase().includes('aura omega')
  );

  if (!auraOmegaSpace) {
    // Try to repurpose "Project 1" or create new
    const project1 = spaces.find((s: { name: string }) => s.name === 'Project 1');
    if (project1) {
      auraOmegaSpace = await updateSpace(project1.id, 'AuraOmega');
    } else {
      auraOmegaSpace = await createSpace(workspace.id, 'AuraOmega');
    }
  }
  
  results.auraOmegaSpace = { id: auraOmegaSpace.id, name: auraOmegaSpace.name };

  // Rename other spaces if they exist
  const project2 = spaces.find((s: { name: string }) => s.name === 'Project 2');
  if (project2) {
    await updateSpace(project2.id, 'Domain Sales');
    results.renamedSpaces = results.renamedSpaces || [];
    (results.renamedSpaces as { from: string; to: string }[]).push({ from: 'Project 2', to: 'Domain Sales' });
  }

  // Create folders and lists in AuraOmega space
  const foldersToCreate = [
    { name: 'D-ID Video Generation', lists: ['Batch Generation', 'Script Queue', 'Completed Videos'] },
    { name: 'Social Posting Schedule', lists: ['TikTok Posts', 'Pinterest Posts', 'Scheduled Queue'] },
    { name: 'Revenue Goals', lists: ['Weekly Targets', 'Monthly Targets', 'Achieved Milestones'] },
    { name: 'Domain Sales Tracker', lists: ['Active Listings', 'Pending Sales', 'Completed Sales'] },
  ];

  results.createdFolders = [];
  results.createdLists = [];

  for (const folderConfig of foldersToCreate) {
    try {
      // Check if folder exists
      const { folders: existingFolders } = await getFolders(auraOmegaSpace.id);
      let folder = existingFolders?.find((f: { name: string }) => f.name === folderConfig.name);
      
      if (!folder) {
        folder = await createFolder(auraOmegaSpace.id, folderConfig.name);
        (results.createdFolders as { id: string; name: string }[]).push({ id: folder.id, name: folder.name });
      }

      // Create lists in folder
      const { lists: existingLists } = await getLists(folder.id);
      for (const listName of folderConfig.lists) {
        const exists = existingLists?.find((l: { name: string }) => l.name === listName);
        if (!exists) {
          const list = await createList(folder.id, listName);
          (results.createdLists as { id: string; name: string; folder: string }[]).push({ 
            id: list.id, 
            name: list.name, 
            folder: folderConfig.name 
          });
        }
      }
    } catch (error) {
      console.error(`Error creating folder ${folderConfig.name}:`, error);
    }
  }

  return results;
}

// Create sample tasks
async function createSampleTasks() {
  const results: { created: unknown[]; errors: unknown[] } = { created: [], errors: [] };

  // Get workspace and AuraOmega space
  const { teams } = await getWorkspaces();
  const workspace = teams[0];
  const { spaces } = await getSpaces(workspace.id);
  
  const auraOmegaSpace = spaces.find((s: { name: string }) => 
    s.name.toLowerCase().includes('auraomega') || s.name === 'AuraOmega'
  );

  if (!auraOmegaSpace) {
    throw new Error('AuraOmega space not found. Run setup first.');
  }

  // Get folders
  const { folders } = await getFolders(auraOmegaSpace.id);
  
  // Sample tasks to create
  const sampleTasks = [
    {
      folder: 'D-ID Video Generation',
      list: 'Batch Generation',
      tasks: [
        {
          name: 'Generate 5 D-ID videos for Radiance Vitamin C Serum',
          description: 'Create batch of promotional videos using D-ID API with different hooks and angles.',
          priority: 1, // Urgent
          due_date: Date.now() + 86400000, // Tomorrow
        },
        {
          name: 'Script variations for anti-aging serum campaign',
          description: 'Write 3 different script variations targeting different demographics.',
          priority: 2, // High
          due_date: Date.now() + 172800000, // 2 days
        },
      ],
    },
    {
      folder: 'Social Posting Schedule',
      list: 'TikTok Posts',
      tasks: [
        {
          name: 'Post batch video to @ryan.auralift',
          description: 'Upload the generated D-ID video with trending hashtags. Include product link in bio.',
          priority: 1,
          due_date: Date.now() + 86400000,
        },
        {
          name: 'Schedule 5 TikTok ads for product launch',
          description: 'Use TikTok Ads Manager to schedule carousel ads for new product line.',
          priority: 2,
          due_date: Date.now() + 259200000, // 3 days
        },
      ],
    },
    {
      folder: 'Revenue Goals',
      list: 'Weekly Targets',
      tasks: [
        {
          name: 'Monitor Stripe payouts for $3,190 today',
          description: 'Track daily revenue from Stripe dashboard. Link: https://dashboard.stripe.com',
          priority: 2,
          due_date: Date.now() + 86400000,
        },
        {
          name: 'Achieve $10,000 weekly revenue target',
          description: 'Track progress across all revenue streams: Shopify, domain sales, affiliate commissions.',
          priority: 1,
          due_date: Date.now() + 604800000, // 1 week
        },
      ],
    },
    {
      folder: 'Domain Sales Tracker',
      list: 'Active Listings',
      tasks: [
        {
          name: 'List 3 premium domains on Unstoppable Domains',
          description: 'Prepare listings for blockchain domains with SEO-optimized descriptions.',
          priority: 3, // Normal
          due_date: Date.now() + 172800000,
        },
      ],
    },
  ];

  for (const group of sampleTasks) {
    try {
      const folder = folders?.find((f: { name: string }) => f.name === group.folder);
      if (!folder) {
        results.errors.push({ folder: group.folder, error: 'Folder not found' });
        continue;
      }

      const { lists } = await getLists(folder.id);
      const list = lists?.find((l: { name: string }) => l.name === group.list);
      if (!list) {
        results.errors.push({ list: group.list, error: 'List not found' });
        continue;
      }

      for (const task of group.tasks) {
        try {
          const created = await createTask(list.id, task);
          results.created.push({ 
            id: created.id, 
            name: created.name, 
            folder: group.folder, 
            list: group.list 
          });
        } catch (taskError) {
          results.errors.push({ task: task.name, error: String(taskError) });
        }
      }
    } catch (error) {
      results.errors.push({ folder: group.folder, error: String(error) });
    }
  }

  return results;
}

// Get workspace summary
async function getWorkspaceSummary() {
  const { teams } = await getWorkspaces();
  const workspace = teams[0];
  
  const { spaces } = await getSpaces(workspace.id);
  
  const summary = {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      members: workspace.members?.length || 0,
    },
    spaces: [] as { id: string; name: string; folders: unknown[]; folderlessLists: unknown[] }[],
    totalFolders: 0,
    totalLists: 0,
    totalTasks: 0,
  };

  for (const space of spaces) {
    const spaceData: { id: string; name: string; folders: unknown[]; folderlessLists: unknown[] } = {
      id: space.id,
      name: space.name,
      folders: [],
      folderlessLists: [],
    };

    // Get folders
    const { folders } = await getFolders(space.id);
    summary.totalFolders += folders?.length || 0;

    for (const folder of folders || []) {
      const { lists } = await getLists(folder.id);
      const folderData: { id: string; name: string; lists: { id: string; name: string; taskCount: number }[] } = {
        id: folder.id,
        name: folder.name,
        lists: [],
      };

      for (const list of lists || []) {
        const { tasks } = await getTasks(list.id);
        folderData.lists.push({
          id: list.id,
          name: list.name,
          taskCount: tasks?.length || 0,
        });
        summary.totalTasks += tasks?.length || 0;
        summary.totalLists++;
      }

      spaceData.folders.push(folderData);
    }

    // Get folderless lists
    const { lists: folderlessLists } = await getFolderlessLists(space.id);
    for (const list of folderlessLists || []) {
      const { tasks } = await getTasks(list.id);
      spaceData.folderlessLists.push({
        id: list.id,
        name: list.name,
        taskCount: tasks?.length || 0,
      });
      summary.totalTasks += tasks?.length || 0;
      summary.totalLists++;
    }

    summary.spaces.push(spaceData);
  }

  return summary;
}

// Test connection
async function testConnection() {
  const { teams } = await getWorkspaces();
  return {
    success: true,
    workspaces: teams.map((t: { id: string; name: string; members?: unknown[] }) => ({
      id: t.id,
      name: t.name,
      members: t.members?.length || 0,
    })),
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json() as ClickUpRequest;

    let result;

    switch (action) {
      case 'test':
        result = await testConnection();
        break;
      case 'summary':
        result = await getWorkspaceSummary();
        break;
      case 'setup':
        result = await setupAuraOmegaWorkspace();
        break;
      case 'createTasks':
        result = await createSampleTasks();
        break;
      case 'getWorkspaces':
        result = await getWorkspaces();
        break;
      case 'getSpaces':
        if (!data?.teamId) throw new Error('teamId required');
        result = await getSpaces(data.teamId as string);
        break;
      case 'createSpace':
        if (!data?.teamId || !data?.name) throw new Error('teamId and name required');
        result = await createSpace(data.teamId as string, data.name as string);
        break;
      case 'getFolders':
        if (!data?.spaceId) throw new Error('spaceId required');
        result = await getFolders(data.spaceId as string);
        break;
      case 'createFolder':
        if (!data?.spaceId || !data?.name) throw new Error('spaceId and name required');
        result = await createFolder(data.spaceId as string, data.name as string);
        break;
      case 'getLists':
        if (!data?.folderId) throw new Error('folderId required');
        result = await getLists(data.folderId as string);
        break;
      case 'createList':
        if (!data?.folderId || !data?.name) throw new Error('folderId and name required');
        result = await createList(data.folderId as string, data.name as string);
        break;
      case 'getTasks':
        if (!data?.listId) throw new Error('listId required');
        result = await getTasks(data.listId as string);
        break;
      case 'createTask':
        if (!data?.listId || !data?.task) throw new Error('listId and task required');
        result = await createTask(data.listId as string, data.task as {
          name: string;
          description?: string;
          priority?: number;
          due_date?: number;
          status?: string;
        });
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ClickUp function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

import Podcast from '../models/podcast.model.js';
import { handleHttpError } from '../utils/handleError.js';

export const getPodcasts = async (_req, res) => {
  const podcasts = await Podcast.find({ published: true }).populate('author', 'name email');
  res.json({ data: podcasts });
};

export const getAllPodcasts = async (_req, res) => {
  const podcasts = await Podcast.find().populate('author', 'name email');
  res.json({ data: podcasts });
};

export const getPodcast = async (req, res) => {
  const podcast = await Podcast.findById(req.params.id).populate('author', 'name email');
  if (!podcast || (!podcast.published && req.user?.role !== 'admin')) {
    return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
  }
  res.json({ data: podcast });
};

export const createPodcast = async (req, res) => {
  const podcast = await Podcast.create({ ...req.body, author: req.user._id });
  res.status(201).json({ data: podcast });
};

export const updatePodcast = async (req, res) => {
  const podcast = await Podcast.findById(req.params.id);
  if (!podcast) return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
  if (!podcast.author.equals(req.user._id)) {
    return handleHttpError(res, 'FORBIDDEN', 403);
  }
  Object.assign(podcast, req.body);
  await podcast.save();
  res.json({ data: podcast });
};

export const deletePodcast = async (req, res) => {
  const podcast = await Podcast.findByIdAndDelete(req.params.id);
  if (!podcast) return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
  res.json({ message: 'Podcast eliminado', data: podcast });
};

export const togglePublished = async (req, res) => {
  const podcast = await Podcast.findById(req.params.id);
  if (!podcast) return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
  podcast.published = !podcast.published;
  await podcast.save();
  res.json({ data: podcast });
};

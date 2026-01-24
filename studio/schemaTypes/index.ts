import { type SchemaTypeDefinition } from 'sanity'
import service from './service'
import testimonial from './testimonial'
import pricing from './pricing'
import post from './post'
import siteSettings from './siteSettings'

export const schemaTypes = [service, testimonial, pricing, post, siteSettings]
